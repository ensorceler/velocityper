package ws

/*
type Hub struct {
	Register   chan *Client
	UnRegister chan *Client
	Broadcast  chan broadCastMessage
	//RoomToClientMap map[string]*Client
	Clients map[*Client]bool
}

type broadCastMessage struct {
	message interface{}
	roomId  string
}

func NewHub() *Hub {
	return &Hub{
		Register:   make(chan *Client),
		UnRegister: make(chan *Client),
		Broadcast:  make(chan broadCastMessage),
		//RoomToClientMap: map[string][]*Client{},
		Clients: make(map[*Client]bool),
	}
}

func (h *Hub) RunHub() {
	for {
		select {
		// case register
		case client := <-h.Register:
			h.Clients[client] = true

		case client := <-h.UnRegister:
			delete(h.Clients, client)
			close(client.send)

		case broadcast := <-h.Broadcast:
			for client := range h.Clients {
				if client.roomId == broadcast.roomId {
					client.send <- broadcast.message
				}
			}
		}
	}
}
*/
