package handler

import (
	"net/http"
	"velocityper/api/internal/ws"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

type WebSocketHandler struct {
	//Hub *ws.Hub
}

func (wsHandler WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ws.ClientRun(w, r)
	/*
		queryParams := r.URL.Query()

		roomId := queryParams.Get("room")
		if roomId == "" {
			w.Write([]byte("bad request"))
			return
		}

		rds := redis_pkg.REDISClient{}

		upgrader.CheckOrigin = func(r *http.Request) bool { return true }
		conn, err := upgrader.Upgrade(w, r, nil)

		if err != nil {
			log.Println("connection error: ", err)
			defer conn.Close()
			return
		}

		go func() {
			fmt.Println("READ goroutine")
			for {
				_, message, err := conn.ReadMessage()

				if err != nil {
					fmt.Println("read err =>", err)
					return
				}

				fmt.Println("message read =>", message)
				rds.PublishMessage(roomId, string(message))
			}
		}()

		go func() {
			fmt.Println("WRITE goroutine")
			pubsub := rds.PubSub(roomId)
			defer pubsub.Close()

			for {
				select {
				case msg := <-pubsub.Channel():
					fmt.Printf("message received %+v\n", msg)
					//err = conn.WriteMessage(1, []byte(msg.Payload))

					err := conn.WriteJSON(map[string]any{
						"message":      msg.Payload,
						"pattern":      msg.Payload,
						"chanel":       msg.Channel,
						"payloadslice": msg.PayloadSlice,
					})

					fmt.Printf("err %+v\n", err)

					if err != nil {
						fmt.Println("write err =>", err)
						return
					}
				}
			}
		}()
	*/
}
