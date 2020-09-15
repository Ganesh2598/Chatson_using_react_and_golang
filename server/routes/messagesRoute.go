package routes

import (
	"fmt"
	"../database"
	"../model"
	"net/http"
	"encoding/json"
)


func GetAllMessage(writer http.ResponseWriter, reader *http.Request) {

	writer.Header().Set("Access-Control-Allow-Origin", "*")

	var messages []model.Message

	Roomname := reader.FormValue("Roomname")

	fmt.Println(Roomname)

	database.Db.Where("Roomname=?",Roomname).Find(&messages)


		result := messages
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)

}
