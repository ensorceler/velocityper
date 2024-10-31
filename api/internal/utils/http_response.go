package utils

import (
	"encoding/json"
	"net/http"
)

func HttpResponse(w http.ResponseWriter, status int, message string, data any) {
	resp, err := json.Marshal(map[string]any{
		"status":  status,
		"message": message,
		"data":    data,
	})
	//w.WriteHeader(status)
	if err != nil {
		//w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Server ERROR"))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Hello", "World")
	w.WriteHeader(http.StatusOK)
	w.Write(resp)
}
