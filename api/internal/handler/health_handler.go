package handler

import (
	"net/http"
	"velocityper/api/internal/utils"
)

type HealthHandler struct {
}

func (h HealthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	//appEnv := viper.Get("APP_ENV")
	utils.HttpResponse(w, http.StatusOK, "Health Check is OK", nil)
}
