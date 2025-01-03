package ws

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"log"
	"net/http"
	redis_cli "velocityper/api/internal/lib/redis"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	//Subprotocols: []string{},
	Subprotocols: []string{"binary"},
}

type Client struct {
	clientID   uuid.UUID
	clientName string
	conn       *websocket.Conn
	//redisClient *redis.Client
	redis  *redis_cli.REDISClient
	roomId string
}

type ReadMessageType struct {
	EventType string `json:"event_type"`
	Message   string `json:"message"`
}

type WriteMessageType struct {
	MessageType string
}

func (c *Client) RegisterClient() {

	// add client_id(uuid) to set room:<roomid>:client
	c.redis.SADD("room:"+c.roomId+":client", c.clientID.String())
	// set creator of room: room:creator:<roomid> -> clientID
	if c.redis.GetKeyVal("room:creator:"+c.roomId) == "" {
		c.redis.SetKeyVal("room:creator:"+c.roomId, c.clientID.String())
	}
	// set client:info:<clientID(uuid)> to clientname
	c.redis.SetKeyVal("client:info:"+c.clientID.String(), c.clientName)
}

func (c *Client) DeRegisterClient() {
	c.redis.SREM("room:"+c.roomId+":client", c.clientID.String())
	c.redis.DeleteKey("client:info:" + c.clientID.String())
	// remove the creator value if that exists
}

func (c *Client) GetUsersInsideRoom() []map[string]interface{} {
	connectedUserIDs := c.redis.SMembers("room:" + c.roomId + ":client")
	connectedUserIDKeys := make([]string, 0)
	creatorID := c.redis.GetKeyVal("room:creator:" + c.roomId)
	//fmt.Println("connected users: ", creatorID)
	fmt.Println("room creator: ", creatorID)
	connectedUsers := make([]map[string]any, 0)
	// create batch keys
	//fmt.Println("batch keys =>", connectedUserIDKeys)
	for _, userId := range connectedUserIDs {
		connectedUserIDKeys = append(connectedUserIDKeys, "client:info:"+userId)
	}
	usernames := c.redis.GetBatchKeyVal(connectedUserIDKeys...)
	//fmt.Println("usernames: ", usernames)
	for idx, userid := range connectedUserIDs {
		isCreator := false
		if userid == creatorID {
			isCreator = true
		}
		connectedUsers = append(connectedUsers, map[string]any{"user_name": usernames[idx], "id": userid, "is_creator": isCreator})
	}
	return connectedUsers
}

/*
case: "joined.clients" : publish "joined:clients:room:"+roomID , subscribe and joined:clients:room:roomID and list of clients,
case: "chat" : publish "chat:room:"+roomID, subscribe and "chat:room:roomID" and send chat event along with name and id:
case "close" : close
---> some clients actually leave, then send a message to indicate they have left.
*/

func (c *Client) ReadPump() {

	defer func() {
		//RecordNumConnections("delete", c.redis, c.roomId)
		fmt.Println("read pump: closed connection")
		c.DeRegisterClient()
		c.conn.Close()
	}()

	for {
		readMessage := ReadMessageType{}
		//err := c.conn.ReadJSON(&v)
		err := c.conn.ReadJSON(&readMessage)

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		switch readMessage.EventType {

		case "joined.clients":
			connectedUserIDs := c.redis.SMembers("room:" + c.roomId + ":client")
			connectedUserIDKeys := make([]string, 0)
			creatorID := c.redis.GetKeyVal("room:creator:" + c.roomId)

			// fmt.Println("connected users: ", creatorID)

			connectedUsers := make([]map[string]any, 0)
			// create batch keys
			//fmt.Println("batch keys =>", connectedUserIDKeys)
			for _, userId := range connectedUserIDs {
				connectedUserIDKeys = append(connectedUserIDKeys, "client:info:"+userId)
			}
			usernames := c.redis.GetBatchKeyVal(connectedUserIDKeys...)
			//fmt.Println("usernames: ", usernames)
			for idx, userid := range connectedUserIDs {
				isCreator := false
				if userid == creatorID {
					isCreator = true
				}
				connectedUsers = append(connectedUsers, map[string]any{"user_name": usernames[idx], "id": userid, "is_creator": isCreator})
			}
			v, err := json.Marshal(connectedUsers)
			if err != nil {
				fmt.Println(err)
			}

			// fmt.Println("connectedUsers =>", connectedUsers, string(v))
			// fmt.Println("connectedUsers =>", connectedUsers, string(v))
			c.redis.PublishMessage("joined:clients:room:"+c.roomId, string(v))

		case "chat.room":
			//fmt.Println("message send", v.Message)
			// get info about the client who has sent the message,message should have details of user too
			clientName := c.redis.GetKeyVal("client:info:" + c.clientID.String())

			message := map[string]interface{}{
				"user_name": clientName,
				"id":        c.clientID,
				"message":   readMessage.Message,
			}

			v, err := json.Marshal(message)
			if err != nil {
				fmt.Println(err)
			}
			fmt.Println("chat event=>", v)
			c.redis.PublishMessage("chat:room:"+c.roomId, string(v))

		default:
			fmt.Println("default case for message")
		}
		//c.send <- x
	}

}

func (c *Client) WritePump() {

	defer func() {
		fmt.Println("write pump: closed connection")
		c.DeRegisterClient()
		c.conn.Close()
	}()

	pubsub := c.redis.PubSub(c.roomId)
	joinedClientsTopic := c.redis.PubSub("joined:clients:room:" + c.roomId)
	chatRoomTopic := c.redis.PubSub("chat:room:" + c.roomId)

	defer func() {
		err := pubsub.Close()
		if err != nil {
			log.Println("pubsub close error:", err)
		}
		err = joinedClientsTopic.Close()
		if err != nil {
			log.Println("joined clients close error:", err)
		}
		err = chatRoomTopic.Close()
		if err != nil {
			log.Println("chat room close error:", err)
		}
	}()

	for {
		select {
		case jcMessage := <-joinedClientsTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"socket_event": "joined.clients",
				"message":      jcMessage.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}

		case chatMessage := <-chatRoomTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"socket_event": "chat.room",
				"message":      chatMessage.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}
		}
	}
}

func ClientRun(w http.ResponseWriter, r *http.Request, roomId string, clientName string) {

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("connection error: ", err)
		defer conn.Close()
		return
	}

	// create a client for each connection
	rc := redis_cli.GetRedisClient()
	cid := uuid.New()
	c := Client{
		//roomId  room: 1234
		clientID:   cid,
		clientName: clientName,
		conn:       conn,
		roomId:     roomId,
		redis:      rc,
	}

	//c.redis.GetKeyVal()
	c.RegisterClient()
	go c.ReadPump()
	go c.WritePump()

}
