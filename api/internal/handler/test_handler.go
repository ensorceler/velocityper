package handler

import (
	"net/http"
	redis_pkg "velocityper/api/internal/lib/redis"
	"velocityper/api/internal/utils"
)

func GetTest(w http.ResponseWriter, r *http.Request) {
	//fmt.Println("log get test")

	queryParams := r.URL.Query()

	qKey := queryParams.Get("key")

	rds := redis_pkg.REDISClient{}

	rds.SetKeyVal("q_key", qKey)

	utils.HttpResponse(w, http.StatusOK, "nothing", "hello,test")
	//w.Write([]byte("hello, test"))
}
