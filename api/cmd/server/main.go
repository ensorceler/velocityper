package main

import (
	"fmt"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"log"
	"net/http"
	"velocityper/api/internal/config"
	"velocityper/api/internal/db"
	"velocityper/api/internal/handler"
	redis_cli "velocityper/api/internal/lib/redis"
	"velocityper/api/internal/middleware"

	"github.com/rs/cors"
)

func main() {

	var err error
	config.LoadConfigENV()
	// create the serveMux
	mux := http.NewServeMux()

	// Check DB Connection
	err = db.GetDBConn().Ping()
	if err != nil {
		log.Panic("DB CONN ERROR: ", err)
	}

	// Check Redis Connection
	redis_cli.CreateNewClient()
	redisPing, err := redis_cli.GetRedisClient().CheckPing().Result()
	if err != nil {
		log.Panic("REDIS CONN ERROR: ", err)
	}

	log.Printf("Redis  PING: %+v\n", redisPing)

	redis_cli.GetRedisClient().FlushAll()

	mux.Handle("GET /metrics", promhttp.Handler())

	//file server at /public directory
	fs := http.FileServer(http.Dir("./public"))

	// Handle requests to serve static files
	mux.Handle("/public/", http.StripPrefix("/public/", fs))

	// health check
	mux.Handle("GET /health", handler.HealthHandler{})

	// user handler
	mux.HandleFunc("GET /users", middleware.AuthMiddleware2(handler.GetUsers))
	mux.HandleFunc("GET /users/{id}", handler.GetUserById)

	// auth handler
	mux.HandleFunc("POST /login", handler.Login)
	mux.HandleFunc("POST /register", handler.Register)
	mux.HandleFunc("POST /logout", handler.Logout)

	// get quotes
	mux.HandleFunc("GET /quotes", handler.GetQuotes)
	// get words
	mux.HandleFunc("GET /words", handler.GetWords)

	// socket connection
	mux.Handle("GET /ws", handler.WebSocketHandler{})
	mux.HandleFunc("POST /checkroom", handler.CheckRoom)

	mux.HandleFunc("GET /test", handler.GetTest)

	// http listen and serve
	addr := fmt.Sprintf(":%s", config.GetEnv("API_PORT"))

	//fmt.Println(addr)
	log.Printf("VELOCITYPER API SERVER, RUNNING AT port %v", addr)

	corsHandler := cors.Default().Handler(mux)
	err = http.ListenAndServe(addr, corsHandler)

	if err != nil {
		log.Printf("Error has occurred when starting the server\n %v \n", err)
	}

}
