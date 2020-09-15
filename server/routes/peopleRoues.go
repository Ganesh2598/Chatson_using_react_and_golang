package routes

import (
	"../database"
	"../model"
	"net/http"
	"encoding/json"
)

func GetAllPeople(writer http.ResponseWriter, reader *http.Request)  {
	
	var users []model.User
	var domain = reader.FormValue("domain")

	database.Db.Where("Email like ?", "%"+domain+"%").Find(&users)

	result := users
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)


}