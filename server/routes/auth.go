package routes

import(
	"net/http"
	"encoding/json"
	"../model"
	"../database"
	"fmt"
	"github.com/dgrijalva/jwt-go"
	"time"
	"github.com/gorilla/csrf"
)

type LoginDetail struct {
	Email string `gorm:"type:varchar(100)" json:"email" binding:"required"`
	Password string `gorm:"type:varchar(100)" json:"password" binding:"required"`
}



type Result struct {
	Result string
}

type loginResult struct {
	Token string 
	Name string
	Email string
}

func RegisterUser(writer http.ResponseWriter, reader *http.Request) {

	var user model.User

	var available []model.User

	err := json.NewDecoder(reader.Body).Decode(&user)
    if err != nil {
        http.Error(writer, err.Error(), 400)
        return
    }


	database.Db.Where("email=?",user.Email).Find(&available)

	

	if (len(available) == 0) {
		database.Db.Create(&user)
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


func LoginUser(writer http.ResponseWriter, reader *http.Request) {
	fmt.Println("Login")
	fmt.Println(csrf.Token(reader))
	var user LoginDetail
	var userdetail []model.User

	err := json.NewDecoder(reader.Body).Decode(&user)
    if err != nil {
        http.Error(writer, err.Error(), 400)
        return
    }


	database.Db.First(&userdetail, "email=?", user.Email)

	if (len(userdetail) != 0) {
		
		if (userdetail[0].Password == user.Password) {
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"user": userdetail[0].Name,
				"email": userdetail[0].Email,
				"exp":  time.Now().Add(time.Hour * time.Duration(1)).Unix(),
			})
			tokenString, err := token.SignedString([]byte("secret"))
			if err != nil {
				fmt.Println(err)
				return
			}
			result := loginResult{tokenString,userdetail[0].Name,userdetail[0].Email}
			send, err := json.Marshal(result)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(send)
		} else {
			result := Result{"Email/Password is Wrong"}
			send, err := json.Marshal(result)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(send)
		}
	} else {
		result := Result{"Email/Password is Wrong"}
			send, err := json.Marshal(result)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(send)
	}
}


func GetCSRFToken(writer http.ResponseWriter, reader *http.Request)  {
	writer.Header().Set("X-CSRF-Token", csrf.Token(reader))
	result := Result{"success"}
			send, err := json.Marshal(result)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(send)
}

func GetHomeToken(writer http.ResponseWriter, reader *http.Request)  {
	writer.Header().Set("X-CSRF-Token", csrf.Token(reader))
	result := Result{"success"}
			send, err := json.Marshal(result)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(send)
}

func GetRegisterToken(writer http.ResponseWriter, reader *http.Request)  {
	writer.Header().Set("X-CSRF-Token", csrf.Token(reader))
	result := Result{"success"}
			send, err := json.Marshal(result)
			if err != nil {
				http.Error(writer, err.Error(), http.StatusInternalServerError)
				return
			}
			writer.Header().Set("Content-Type", "application/json")
			writer.Write(send)
}