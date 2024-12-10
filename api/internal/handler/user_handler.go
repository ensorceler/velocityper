package handler

import (
	"net/http"
	"velocityper/api/internal/utils"
)

func GetUserById(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	w.Write([]byte("hello" + id))
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("userId")

	//db.GetDBConn().QueryRow("select * from users where")
	utils.HttpResponse(w, http.StatusOK, "Success", map[string]any{
		"user_id": userId,
	})

}
