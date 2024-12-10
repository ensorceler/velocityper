package ws

import (
	"fmt"
	"log"
	"net/http"
	redis_cli "velocityper/api/internal/lib/redis"
	"velocityper/api/internal/utils"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	conn *websocket.Conn
	//redisClient *redis.Client
	redis  *redis_cli.REDISClient
	roomId string
}

func (c *Client) readMessage() {

	for {
		_, message, err := c.conn.ReadMessage()

		if err != nil {
			fmt.Println("read err =>", err)
			return
		}

		fmt.Println("message read =>", message)
		c.redis.PublishMessage(c.roomId, string(message))
		//c.send <- x
	}

}

func (c *Client) writeMessage() {

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

func ClientRun(w http.ResponseWriter, r *http.Request) {

	q := r.URL.Query()
	roomId := q.Get("room")
	fmt.Println("roomId: ", roomId)

	if roomId == "" {
		//w.Write([]byte("bad request"))
		utils.HttpResponse(w, 403, "Bad Request", nil)
		return
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("connection error: ", err)
		defer conn.Close()
		return
	}

	// create a client for each connection
	c := Client{
		conn:   conn,
		roomId: roomId,
		redis:  redis_cli.GetRedisClient(),
	}
	//c.redis.GetKeyVal()
	go c.readMessage()
	go c.writeMessage()

}
