package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	redis_cli "velocityper/api/internal/lib/redis"
	"velocityper/api/internal/utils"
	"velocityper/api/internal/ws"
)

type WebSocketHandler struct {
	//Hub *ws.Hub
}

type CheckRoomRequestBody struct {
	RoomID string `json:"room_id"`
}

func (wsHandler WebSocketHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	q := r.URL.Query()
	roomId := q.Get("room")
	clientName := q.Get("client")
	//fmt.Println("roomId: ", roomId)

	if roomId == "" {
		log.Println("WS: NO RoomID, Bad Request")
		utils.HttpResponse(w, 403, "Bad Request", nil)
		return
	}
	ws.ClientRun(w, r, roomId, clientName)
}

func CheckRoom(w http.ResponseWriter, r *http.Request) {

	var err error
	reqBody := CheckRoomRequestBody{}
	err = json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		http.Error(w, "Unable to read request body", http.StatusBadRequest)
		return
	}
	rc := redis_cli.GetRedisClient()
	fmt.Println("roomId: ", reqBody)
	connectedUserIDs := rc.SMembers("room:" + reqBody.RoomID + ":client")

	//if tls.ConnectionState{}
	fmt.Println("connecteduserids:", connectedUserIDs)
	if len(connectedUserIDs) >= 1 {
		utils.HttpResponse(w, http.StatusOK, "Okay to Join!", nil)
	} else if len(connectedUserIDs) == 0 {
		utils.HttpResponse(w, http.StatusInternalServerError, "Room Not Valid for Joining!", nil)
	}
}
