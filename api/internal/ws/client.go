package ws

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"log"
	"net/http"
	"time"
	redis_cli "velocityper/api/internal/lib/redis"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// chrome is pretty strict about sub protocols
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
	BroadcastEvent string `json:"broadcast_event"`
	Message        string `json:"message"`
}

type RaceParticipant struct {
	UserName   string `json:"user_name"`
	ID         string `json:"id"` // assuming userid is a string, adjust type if needed
	IsCreator  bool   `json:"is_creator"`
	JoinedRace bool   `json:"joined_race"`
}

type TypeRaceData struct {
	RaceParticipant
	RaceData    string `json:"race_data"` // Assuming race_data is string, adjust type if needed
	RaceRanking any    `json:"race_ranking,omitempty"`
}

/*
Redis keeping track of users:
redis set: room:<roomid>:client  -> store the clientID
redis key room:creator:<roomdid> -> set the clientid for creator
redis key client:info:<clientid> -> set the client name clientid<->client_name key,val pair

set the race-config for room: room:<room-id>:race:config
set the race-start for room:
// race ranking
room:<room-id>:race:ranking

*/

func (c *Client) RegisterClient() {

	// add client_id(uuid) to set room:<roomid>:client
	c.redis.SADD("room:"+c.roomId+":client", c.clientID.String())
	// set creator of room: room:creator:<roomid> -> clientID
	if c.redis.GetKeyVal("room:creator:"+c.roomId) == "" {
		c.redis.SetKeyVal("room:creator:"+c.roomId, c.clientID.String())
		c.JoinRaceClient()
	}
	// set client:info:<clientID(uuid)> to clientname
	c.redis.SetKeyVal("client:info:"+c.clientID.String(), c.clientName)
}

func (c *Client) DeRegisterClient() {
	c.redis.SREM("room:"+c.roomId+":client", c.clientID.String())
	c.redis.DeleteKey("client:info:" + c.clientID.String())
	// remove the creator value if that exists

}

func (c *Client) JoinRaceClient() {
	c.redis.SADD("room:"+c.roomId+":race-joinee", c.clientID.String())
}

func (c *Client) GetUsersInsideRoom() []RaceParticipant {
	connectedUserIDs := c.redis.SMembers("room:" + c.roomId + ":client")
	connectedUserIDKeys := make([]string, 0)
	creatorID := c.redis.GetKeyVal("room:creator:" + c.roomId)
	connectedUsers := []RaceParticipant{}

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
		// check if race-client is part or not...
		hasJoinedRace := c.redis.SIsMember("room:"+c.roomId+":race-joinee", userid)
		connectedUsers = append(connectedUsers,
			RaceParticipant{
				UserName:   usernames[idx].(string),
				ID:         userid,
				IsCreator:  isCreator,
				JoinedRace: hasJoinedRace,
			},
		)
	}
	return connectedUsers
}

func (c *Client) GetRaceDataOfParticipants() []TypeRaceData {

	allUsersInRoom := c.GetUsersInsideRoom()
	//raceDataUsers.Range(fun)
	raceData := []TypeRaceData{}
	for _, user := range allUsersInRoom {
		raceDataForUser := c.redis.GetKeyVal("room:" + c.roomId + ":client:" + user.ID + ":racedata")
		var raceRankingUser any
		raceRankingUser = c.redis.ZRank("room:"+c.roomId+":race:ranking", user.ID)
		// if not found then set nil
		if raceRankingUser == -1 {
			raceRankingUser = nil
		} else {
			raceRankingUser = raceRankingUser.(int64) + 1
		}
		if user.JoinedRace {
			raceData = append(raceData, TypeRaceData{user, raceDataForUser, raceRankingUser})
		}
	}
	return raceData
}

func (c *Client) RoomInfo() map[string]interface{} {
	//c.redis.GetKeyVal("room")
	//fmt.Println
	roomCreatorID := c.redis.GetKeyVal("room:creator:" + c.roomId)
	raceStatusRoomString := c.redis.GetKeyVal("room:" + c.roomId + ":race-status")
	raceStatusRoom := false
	if raceStatusRoomString == "true" {
		raceStatusRoom = true
	}
	roomInfo := map[string]interface{}{
		"room_id":      c.roomId,
		"room_creator": roomCreatorID,
		"race_started": raceStatusRoom,
	}
	return roomInfo
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
			fmt.Println("read-json error: ", err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		switch readMessage.EventType {

		case "join.room":
			connectedUsers := c.GetUsersInsideRoom()
			v, err := json.Marshal(connectedUsers)
			if err != nil {
				fmt.Println(err)
			}
			//clientInfo:=
			//clientID
			userInfo := map[string]interface{}{
				"room_id":    c.roomId,
				"user_id":    c.clientID.String(),
				"user_name":  c.redis.GetKeyVal("client:info:" + c.clientID.String()),
				"is_creator": c.redis.GetKeyVal("room:creator:"+c.roomId) == c.clientID.String(),
			}
			userInfoString, err := json.Marshal(userInfo)
			if err != nil {
				fmt.Println(err)
			}
			// pubsub:client:<client-id>:info
			c.redis.PublishMessage("pubsub:client:"+c.clientID.String()+":info", string(userInfoString))
			//pubsub:room:<room-id>:clients:joined
			c.redis.PublishMessage("pubsub:room:"+c.roomId+":clients:joined", string(v))

		case "update.raceconfig.room":
			// set the config of the entire race by the creator for the race customization
			// can only be sent by the creator of the room
			// check whether creatorf

			isCreator := c.redis.GetKeyVal("room:creator:"+c.roomId) == c.clientID.String()
			/*
				log.Printf("Debug set.config.type-race:\n")
				log.Printf("Room ID: %s\n", c.roomId)
				log.Printf("Current Client ID: %s\n", c.clientID.String())
				log.Printf("Creator ID from Redis: %s\n", c.redis.GetKeyVal("room:creator:"+c.roomId))
				log.Printf("Is Creator: %v\n", isCreator)
			*/
			if isCreator {
				log.Println("update.raceconfig.room =>", "room:"+c.roomId+":race:config", readMessage.Message)
				c.redis.SetKeyVal("room:"+c.roomId+":race:config", readMessage.Message)
				// pubsub:room:<room-id>:race:config
				c.redis.PublishMessage("pubsub:room:"+c.roomId+":race:config", readMessage.Message)
			}

		case "join.type-race":
			//c.redis.SetKeyVal("room:"+c.roomId+":race-client:",)
			c.JoinRaceClient()
			connectedUsers := c.GetUsersInsideRoom()
			v, err := json.Marshal(connectedUsers)
			if err != nil {
				fmt.Println(err)
			}
			roomTestConfig := c.redis.GetKeyVal("room:" + c.roomId + ":race:config")

			//pubsub:room:<room-id>:clients:joined
			c.redis.PublishMessage("pubsub:room:"+c.roomId+":clients:joined", string(v))
			// test-config has to sent to each user in the room
			// pubsub:room:<room-id>:race:config
			c.redis.PublishMessage("pubsub:room:"+c.roomId+":race:config", roomTestConfig)

		case "start.type-race":
			// check whether the clientid is the creator or not then only then the race can be started.
			//
			//start.race
			roomCreatorID := c.redis.GetKeyVal("room:creator:" + c.roomId)
			// can only start with creator
			if roomCreatorID == c.clientID.String() {
				// set the race-status to true
				c.redis.SetKeyVal("room:"+c.roomId+":race-status", "true")
				//fmt.Println("this is the room creator ---->", roomCreatorID, c.clientID.String())
				roomInfo := c.RoomInfo()
				raceData := c.GetRaceDataOfParticipants()
				v, err := json.Marshal(roomInfo)
				if err != nil {
					log.Println("start.type-race: error marshal")
				}

				u, err := json.Marshal(raceData)

				if err != nil {
					log.Println("broadcast.racedata: error marshal")
				}
				// pubsub:room:<room-id>:info
				c.redis.PublishMessage("pubsub:room:"+c.roomId+":info", string(v))
				//c.redis.PublishMessage9
				// pubsub:room:<room-id>:clients:racedata
				c.redis.PublishMessage("pubsub:room:"+c.roomId+":clients:racedata", string(u))
			}

		case "broadcast.racedata":

			//fmt.Println("readMessage.Message)
			log.Println("broadcast.racedata =>", readMessage.Message)
			//fmt.Println()

			c.redis.SetKeyVal("room:"+c.roomId+":client:"+c.clientID.String()+":racedata", readMessage.Message)

			raceData := c.GetRaceDataOfParticipants()
			v, err := json.Marshal(raceData)

			if err != nil {
				log.Println("broadcast.racedata: error marshal")
			}

			// pubsub:room:<room-id>:clients:racedata
			c.redis.PublishMessage("pubsub:room:"+c.roomId+":clients:racedata", string(v))

		case "finished.race":
			// finish race
			// then keep a track of these things
			// timestamp will be the score
			score := float64(time.Now().Unix())
			c.redis.SetKeyVal("room:"+c.roomId+":client:"+c.clientID.String()+":racedata", readMessage.Message)

			log.Println("finished.race =>", score)
			// add to sorted set the client-id along with score
			c.redis.ZADD("room:"+c.roomId+":race:ranking", score, c.clientID.String())

			raceData := c.GetRaceDataOfParticipants()
			v, err := json.Marshal(raceData)

			if err != nil {
				log.Println("broadcast.racedata: error marshal")
			}
			// pubsub:room:<room-id>:clients:racedata
			c.redis.PublishMessage("pubsub:room:"+c.roomId+":clients:racedata", string(v))

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
				log.Println(err)
			}
			log.Println("chat event=>", string(v))
			c.redis.PublishMessage("pubsub:chat:room:"+c.roomId, string(v))

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
	// pubsub:client:<client-id>:info
	clientInfoPubSubTopic := c.redis.PubSub("pubsub:client:" + c.clientID.String() + ":info")

	//pubsub:room:<room-id>:clients:joined
	joinedClientsTopic := c.redis.PubSub("pubsub:room:" + c.roomId + ":clients:joined")

	// pubsub:chat:room:<room-id>
	chatRoomTopic := c.redis.PubSub("pubsub:chat:room:" + c.roomId)

	// pubsub:room:<room-id>:race:config
	raceConfigTopic := c.redis.PubSub("pubsub:room:" + c.roomId + ":race:config")

	// pubsub:room:<room-id>:info
	roomInfoTopic := c.redis.PubSub("pubsub:room:" + c.roomId + ":info")

	// pubsub:room:<room-id>:clients:racedata
	raceDataTopic := c.redis.PubSub("pubsub:room:" + c.roomId + ":clients:racedata")

	defer func() {
		err := pubsub.Close()
		if err != nil {
			log.Println("pubsub close error:", err)
		}

		err = clientInfoPubSubTopic.Close()
		if err != nil {
			log.Println("pubsub: client info  close error:", err)
		}

		err = joinedClientsTopic.Close()
		if err != nil {
			log.Println("pubsub: joined clients close error:", err)
		}

		err = chatRoomTopic.Close()
		if err != nil {
			log.Println("pubsub:  chat room close error:", err)
		}

		err = raceConfigTopic.Close()
		if err != nil {
			log.Println("pubsub:  race config close error:", err)
		}

		err = roomInfoTopic.Close()
		if err != nil {
			log.Println("pubsub:  room config close error:", err)
		}

		err = raceDataTopic.Close()
		if err != nil {
			log.Println("pubsub:  race data close error:", err)
		}
	}()
	//make()
	for {
		select {
		case chatMessage := <-chatRoomTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"broadcast_event": "chat.room",
				"message":         chatMessage.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}
		// information about the client
		case clientInfoMessage := <-clientInfoPubSubTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"broadcast_event": "client.info",
				"message":         clientInfoMessage.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}
		// all clients who has joined
		case jcMessage := <-joinedClientsTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"broadcast_event": "joined.clients.room",
				"message":         jcMessage.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}
			// race config message to the clients in the room
		case raceConfigMsg := <-raceConfigTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"broadcast_event": "race.config",
				"message":         raceConfigMsg.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}

		case roomInfoMessage := <-roomInfoTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"broadcast_event": "room.info",
				"message":         roomInfoMessage.Payload,
			}); err != nil {
				fmt.Println("Write Error", err)
				return
			}

		case raceDataMessage := <-raceDataTopic.Channel():
			if err := c.conn.WriteJSON(map[string]interface{}{
				"broadcast_event": "race.data",
				"message":         raceDataMessage.Payload,
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

/**
debugging guidelines:
first recheck the event_types and broadcast_event are matching in frontend and backend both

*/
