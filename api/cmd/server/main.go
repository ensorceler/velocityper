package main

import (
	"log"
	"net/http"
	"velocityper/api/internal/config"
	"velocityper/api/internal/db"
	"velocityper/api/internal/handler"
	"velocityper/api/internal/middleware"
	"velocityper/api/internal/ws"
)

func main() {

	var err error
	config.LoadConfigENV()

	mux := http.NewServeMux()
	err = db.GetDBConn().Ping()
	if err != nil {
		log.Panic("DB CONN ERROR: ", err)
	}

	hub := ws.NewHub()
	go hub.RunHub()

	// health check
	mux.Handle("GET /health", handler.HealthHandler{})

	// user handler
	mux.Handle("GET /users", middleware.AuthMiddleware(handler.GetUsers))
	mux.HandleFunc("GET /users/{id}", handler.GetUserById)

	// auth handler
	mux.HandleFunc("POST /login", handler.Login)
	mux.HandleFunc("POST /register", handler.Register)
	mux.HandleFunc("POST /logout", handler.Logout)

	// socket connection
	wsHandler := handler.WebSocketHandler{Hub: hub}
	mux.Handle("GET /chat", wsHandler)
	//mux.HandleFunc("GET /socket")

	// http listen and serve
	port := config.GetEnv("PORT")
	addr := ":" + port
	//fmt.Println(addr)
	log.Printf("VELOCITYPER API SERVER, RUNNING AT %v", addr)
	err = http.ListenAndServe(addr, mux)

	if err != nil {
		log.Printf("Error has occurred when starting the server\n %v \n", err)
	}

}
