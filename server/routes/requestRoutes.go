package routes

import (
	"../database"
	"../model"
	"net/http"
	"encoding/json"
)

func GetAllRequest(writer http.ResponseWriter, reader *http.Request)  {
	var email = reader.FormValue("email")
	
	var request []model.Request
	
	database.Db.Where("toname=?",email).Find(&request)
	result := request
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
}

func AcceptRequest(writer http.ResponseWriter, reader *http.Request)  {
	
	var username = reader.FormValue("username")
	var request model.Request
	var room model.Privateroom
	
	database.Db.Model(&room).Where("Username=?",username).Update("Status","Accepted")
	database.Db.Unscoped().Where("Fromname=?",username).Delete(&request)
	result := room
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
}

func RejectRequest(writer http.ResponseWriter, reader *http.Request)  {
	
	var username = reader.FormValue("username")
	var request model.Request
	database.Db.Unscoped().Where("Fromname=?",username).Delete(&request)
	result := Result{"success"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
}