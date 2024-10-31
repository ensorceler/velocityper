package ws

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	conn   *websocket.Conn
	hub    *Hub
	send   chan any
	roomId string
}

func (c *Client) readMessage() {

	for {
		var x interface{}
		err := c.conn.ReadJSON(&x)
		if err != nil {
			fmt.Println("Error reading json", err)
			return
		}
		//c.send <- x
		c.hub.Broadcast <- broadCastMessage{x, c.roomId}
	}

}

func (c *Client) writeMessage() {

	for {
		select {
		case msg := <-c.send:
			fmt.Println("msg =>", msg)
			err := c.conn.WriteJSON(msg)
			if err != nil {
				fmt.Println("Write Error", err)
				return
			}
		}
	}
}

func ClientRun(w http.ResponseWriter, r *http.Request, hub *Hub) {

	q := r.URL.Query()
	roomId := q.Get("roomId")
	fmt.Println("roomId: ", roomId)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrader Connection Error: ", err)
		return
	}

	//hub:=Hub{}
	// fmt.Println("upgrader connection error: ",err)

	c := Client{conn, hub, make(chan any), roomId}
	c.hub.Register <- &c

	go c.readMessage()
	go c.writeMessage()

}
