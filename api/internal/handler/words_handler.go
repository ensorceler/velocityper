package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"velocityper/api/internal/db"
	"velocityper/api/internal/utils"

	"github.com/Masterminds/squirrel"
)

type Quotes struct {
	Quote    string `json:"quote"`
	Source   string `json:"source"`
	QuotedBy string `json:"quoted_by"`
	Length   int    `json:"length"`
}

func GetQuotes(w http.ResponseWriter, r *http.Request) {

	// Parse query parameters
	//queryParams := r.URL.Query()

	//quoteType := queryParams.Get("quote_type")

	sq := squirrel.StatementBuilder.PlaceholderFormat(squirrel.Question)

	var err error

	qb1 := sq.Select("quote,source,quoted_by,length").From("quotes").Where("length<100").OrderBy("length desc").Limit(50).Prefix("(").Suffix(")")
	qb2 := sq.Select("quote,source,quoted_by,length").From("quotes").Where("length>100 and length<220").OrderBy("length desc").Limit(50).Prefix("(").Suffix(")")
	qb3 := sq.Select("quote,source,quoted_by,length").From("quotes").Where("length>400").OrderBy("length").Limit(50).Prefix("(").Suffix(")")

	query1, _, err := qb1.ToSql()
	query2, _, err2 := qb2.ToSql()
	query3, _, err3 := qb3.ToSql()

	if err != nil || err2 != nil || err3 != nil {
		http.Error(w, "QUERY ERROR", http.StatusInternalServerError)
		return
	}

	//fmt.Println("SQL =>", query)
	finalQuery := fmt.Sprintf("%s UNION ALL %s UNION ALL %s", query1, query2, query3)
	fmt.Println("final query =>", finalQuery)

	rows, err := db.GetDBConn().Query(finalQuery)
	if err != nil {
		http.Error(w, "DB ERROR", http.StatusInternalServerError)
		fmt.Println("err:", err)
		return
	}
	defer rows.Close()

	allQuotes := []Quotes{}

	for rows.Next() {
		q := Quotes{}
		rows.Scan(&q.Quote, &q.Source, &q.QuotedBy, &q.Length)
		allQuotes = append(allQuotes, q)
	}

	utils.HttpResponse(w, 200, "All Quotes", allQuotes)
}

func GetWords(w http.ResponseWriter, r *http.Request) {

	//utils.

	var err error

	currDir, err := os.Getwd()

	if err != nil {
		utils.HttpResponse(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}

	data, err := os.ReadFile(currDir + "/assets/words.json")

	if err != nil {
		fmt.Println("error ", err)
		utils.HttpResponse(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}
	var wordData any
	err = json.Unmarshal(data, &wordData)

	if err != nil {
		fmt.Println("error ", err)
		utils.HttpResponse(w, http.StatusInternalServerError, "Internal Server Error", nil)
	}

	utils.HttpResponse(w, http.StatusOK, "All Words", wordData)
}
