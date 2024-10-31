package handler

import (
	"net/http"
	"velocityper/api/internal/ws"
)

type WebSocketHandler struct {
	Hub *ws.Hub
}

func (wsHandler WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ws.ClientRun(w, r, wsHandler.Hub)
}

/*
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("conn err", err)
		return
	}

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("err =>", err)
			return
		}
		err = conn.WriteMessage(messageType, message)
		conn.WriteJSON(map[string]any{
			"message": string(message),
			"reply":   string(message) + " NOICE",
		})
		if err != nil {
			fmt.Println("err =>", err)
			return
		}
		fmt.Printf("messagetype %v\n message %v =>", messageType, string(message))
	}*/
