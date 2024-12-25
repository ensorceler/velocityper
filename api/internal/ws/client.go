package ws

import (
	"fmt"
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
	conn *websocket.Conn
	//redisClient *redis.Client
	redis  *redis_cli.REDISClient
	roomId string
}

type ReadMessageType struct {
	EventType string `json:"event_type"`
	Message   string `json:"message"`
}

func (c *Client) readMessage() {

	defer func() {
		//RecordNumConnections("delete", c.redis, c.roomId)
		c.conn.Close()
	}()

	for {
		v := ReadMessageType{}
		//err := c.conn.ReadJSON(&v)
		_, message, err := c.conn.ReadMessage()

		if err != nil {
			fmt.Println("readMessage function error=>", err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		fmt.Println("logging the message", message)
		switch v.EventType {

		case "broadcast_message":
			fmt.Println("message read =>", v.Message)
			c.redis.PublishMessage(c.roomId, string(v.Message))

		case "chat":
			//fmt.Println("message send", v.Message)
			c.redis.PublishMessage(c.roomId, string(v.Message))

		default:
			//fmt.Println("message send", v.Message)
			//c.redis.PublishMessage(c.roomId, string(v.Message))
			//c.conn.Close()
			fmt.Println("default case for message")
		}
		//c.send <- x
	}

}

func (c *Client) writeMessage() {

	defer func() {
		//		RecordNumConnections("delete", c.redis, c.roomId)
		c.conn.Close()
	}()

	pubsub := c.redis.PubSub(c.roomId)
	defer pubsub.Close()

	for {
		select {
		case msg := <-pubsub.Channel():
			fmt.Println("msg =>", msg)
			err := c.conn.WriteJSON(msg)
			if err != nil {
				fmt.Println("Write Error", err)
				return
			}
		}
	}
}

func ClientRun(w http.ResponseWriter, r *http.Request, roomId string) {

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("connection error: ", err)
		defer conn.Close()
		return
	}

	// create a client for each connection
	redisClient := redis_cli.GetRedisClient()

	c := Client{
		//roomId  room: 1234
		conn:   conn,
		roomId: roomId,
		redis:  redisClient,
	}

	//c.redis.GetKeyVal()
	go c.readMessage()
	go c.writeMessage()

}
