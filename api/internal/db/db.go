package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"
	"velocityper/api/internal/config"

	_ "github.com/lib/pq"
)

func GetDBConn() *sql.DB {
	host := config.GetEnv("DB_HOST")
	port := config.GetEnv("DB_PORT")
	user := config.GetEnv("DB_USER")
	dbname := config.GetEnv("DB_DBNAME")
	password := config.GetEnv("DB_PASSWORD")

	connString := fmt.Sprintf("host=%v port=%v dbname=%v user=%v password=%s sslmode=require", host, port, dbname, user, password)
	db, err := sql.Open("postgres", connString)
	if err != nil {
		log.Panic(err)
	}

	db.SetMaxIdleConns(25)
	db.SetMaxOpenConns(25)
	db.SetConnMaxIdleTime(time.Second * 60)

	return db
}
