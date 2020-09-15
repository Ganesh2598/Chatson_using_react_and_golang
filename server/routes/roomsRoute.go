package routes

import (
	"net/http"
	"encoding/json"
	"../database"
	"../model"
	"fmt"
)


func GetAllPublicRoom(writer http.ResponseWriter, reader *http.Request) {
	var rooms []model.Publicroom

	database.Db.Find(&rooms)

	result := rooms
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)

}

func CreatePublicRoom(writer http.ResponseWriter, reader *http.Request) {

	var room model.Publicroom

	var available []model.Publicroom
	
	err := json.NewDecoder(reader.Body).Decode(&room)
    if err != nil {
        http.Error(writer, err.Error(), 400)
        return
	}

	fmt.Println(room)

	database.Db.Where("Roomname=?",room.Roomname).Find(&available)

	if (len(available) == 0) {
		database.Db.Create(&room)
		result := Result{"success"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	} else{
		result := Result{"Already exist"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	}
	
}

func GetAllPrivateRoom(writer http.ResponseWriter, reader *http.Request) {
	var rooms []model.Privateroom

	var username = reader.FormValue("username")

	database.Db.Where("Username=? AND Status IN (?)",username,[]string{"Accepted","Admin"}).Find(&rooms)

		result := rooms
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)

}

func CreatePrivateRoom(writer http.ResponseWriter, reader *http.Request) {

	var room model.Privateroom

	var available []model.Privateroom
	
	err := json.NewDecoder(reader.Body).Decode(&room)
    if err != nil {
        http.Error(writer, err.Error(), 400)
        return
	}

	fmt.Println(room)

	database.Db.Where("Roomname=?",room.Roomname).Find(&available)

	if (len(available) == 0) {
		database.Db.Create(&room)
		result := Result{"success"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	} else{
		result := Result{"Already exist"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	}
	
}

func JoinPrivateRoom(writer http.ResponseWriter, reader *http.Request) {
	var room model.Privateroom
	var request model.Request
	var available []model.Privateroom
	
	err := json.NewDecoder(reader.Body).Decode(&room)
    if err != nil {
        http.Error(writer, err.Error(), 400)
        return
	}

	database.Db.Where("Roomname=?",room.Roomname).Find(&available)

	if (len(available) > 0) {
		
		room.Admin = available[0].Admin
		room.Status = "Requested"
		room.Privilege = available[0].Privilege

		request = model.Request{
			Toname : available[0].Admin,
			Roomname : room.Roomname,
			Fromname : room.Username,
		}

		fmt.Println(room)
		fmt.Println(request)
		database.Db.Create(&request)
		database.Db.Create(&room)
		result := Result{"success"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	} else{
		result := Result{"No room exist"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	}

}


func CreatePrivateChat(writer http.ResponseWriter, reader *http.Request) {

	var chatroom model.Privatechat

	err := json.NewDecoder(reader.Body).Decode(&chatroom)
    if err != nil {
        http.Error(writer, err.Error(), 400)
        return
	}

	fmt.Println(chatroom)

	database.Db.Create(&chatroom)
	result := Result{"success"}
		send, err := json.Marshal(result)
		if err != nil {
			http.Error(writer, err.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)
	
}

func GetReceiverChats(writer http.ResponseWriter, reader *http.Request) {
	var rooms []model.Privatechat

	var username = reader.FormValue("username")

	database.Db.Where("Receiver=?", username).Find(&rooms)

		result := rooms
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
		 writer.Write(send)
}

func GetSenderChats(writer http.ResponseWriter, reader *http.Request) {
	var rooms []model.Privatechat

	var username = reader.FormValue("username")

	database.Db.Where("Sender=?", username).Find(&rooms)

		result := rooms
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
		 writer.Write(send)
}

func GetAllPrivateRooms(writer http.ResponseWriter, reader *http.Request)  {
	var rooms []model.Privateroom

	database.Db.Find(&rooms)

	result := rooms
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)	

}

func CurrentRoomDetails(writer http.ResponseWriter, reader *http.Request)  {
	var rooms []model.Privateroom

	var roomname = reader.FormValue("roomname")
	var username = reader.FormValue("username")

	database.Db.Where("Roomname=? AND Username=?",roomname, username).Find(&rooms)

	result := rooms
		send, err1 := json.Marshal(result)
		if err1 != nil {
			http.Error(writer, err1.Error(), http.StatusInternalServerError)
			return
		}
		writer.Header().Set("Content-Type", "application/json")
 		writer.Write(send)	

}