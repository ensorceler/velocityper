package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"velocityper/api/internal/db"
	"velocityper/api/internal/lib/auth"
	"velocityper/api/internal/utils"
)

type LoginRequestBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	Id        string `json:"id"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	var respBody LoginRequestBody
	var err error
	err = json.NewDecoder(r.Body).Decode(&respBody)
	if err != nil {
		utils.HttpResponse(w, http.StatusBadRequest, "Bad Request", nil)
		return
	}
	// check if the user is present in DB
	user := User{}
	qRow := db.GetDBConn().QueryRow("select username, email, created_at from users where username=$1 and password=$2", respBody.Username, respBody.Password)
	err = qRow.Scan(&user.Username, &user.Email, &user.CreatedAt)

	if err != nil {
		utils.HttpResponse(w, http.StatusInternalServerError, "DB ERROR", nil)
		fmt.Println("err:", err)
		return
	}

	// if OK then send a signed url with response status OK
	token, err := auth.GetSignedToken(auth.JWTPayload{Id: "434"})
	if err != nil {
		utils.HttpResponse(w, http.StatusInternalServerError, "Token Error", nil)
		fmt.Println("err:", err)
		return
	}
	utils.HttpResponse(w, http.StatusOK, "OK", map[string]any{
		"token": token,
		//"username": respBody.Username,
		"user": user,
	})
	//r.Header.Set("Hello", "World")
}

func Register(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("register"))
}

func Logout(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("logout"))
}
