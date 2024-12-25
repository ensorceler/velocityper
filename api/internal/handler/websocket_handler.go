package handler

import (
	"log"
	"net/http"
	"velocityper/api/internal/utils"
	"velocityper/api/internal/ws"
)

type WebSocketHandler struct {
	//Hub *ws.Hub
}

func (wsHandler WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	q := r.URL.Query()
	roomId := q.Get("room")
	//fmt.Println("roomId: ", roomId)

	if roomId == "" {
		log.Println("WS: NO RoomID, Bad Request")
		utils.HttpResponse(w, 403, "Bad Request", nil)
		return
	}
	ws.ClientRun(w, r, roomId)
}
