package main

import (
	"./routes"
	"./database"
	"github.com/graarh/golang-socketio"
	"github.com/graarh/golang-socketio/transport"
	"log"
	"fmt"
	"net/http"
	"time"
	"github.com/rs/cors"
	"golang.org/x/time/rate"
	"github.com/gorilla/csrf"
)



type Message struct {
	Roomname string
	User string
	Message string
}

type swap struct {
	oldRoom string
	newRoom string
}
var rt = rate.Every(1 * time.Second / 50)
var limiter = rate.NewLimiter(rt, 17)

func limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if limiter.Allow() == false {
			http.Error(w, http.StatusText(429), http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main()  {

	csrfMiddleware := csrf.Protect([]byte("nsdvjvndjsnvdsnj"),
									csrf.Secure(false),
									csrf.TrustedOrigins([]string{"http://localhost:3000"}),
									csrf.Path("/"),
									csrf.HttpOnly(false))
	
	Mux := http.NewServeMux()

	database.Connection()

	Server := gosocketio.NewServer(transport.GetDefaultWebsocketTransport())

	Server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
		//log.Println("New client connected", c.Id())
	})

	Server.On("joinChannel", func(c *gosocketio.Channel, room string) {
		c.Join(room)
	})

	Server.On("swapChannel", func(c *gosocketio.Channel, room swap) {
		c.Leave(room.oldRoom)
		c.Join(room.newRoom)
	})

	Server.On("message", func(c *gosocketio.Channel, msg Message) {
		database.Db.Create(&msg)
		c.BroadcastTo(msg.Roomname, "message", msg)
		fmt.Println(msg)
	})

	

	Mux.Handle("/socket.io/", Server)

	Mux.HandleFunc("/getToken", routes.GetCSRFToken)
	Mux.HandleFunc("/getHomeToken", routes.GetHomeToken)
	Mux.HandleFunc("/getRegisterToken", routes.GetRegisterToken)
	Mux.HandleFunc("/register", routes.RegisterUser)
	Mux.HandleFunc("/login", routes.LoginUser)
	Mux.HandleFunc("/getAllMessage", routes.GetAllMessage)
	Mux.HandleFunc("/getAllPublicRoom", routes.GetAllPublicRoom)
	Mux.HandleFunc("/createPublicRoom", routes.CreatePublicRoom)
	Mux.HandleFunc("/getAllPrivateRoom", routes.GetAllPrivateRoom)
	Mux.HandleFunc("/createPrivateRoom", routes.CreatePrivateRoom)
	Mux.HandleFunc("/joinPrivateRoom", routes.JoinPrivateRoom)
	Mux.HandleFunc("/getAllPeople", routes.GetAllPeople)
	Mux.HandleFunc("/getReceiverChats", routes.GetReceiverChats)
	Mux.HandleFunc("/getSenderChats", routes.GetSenderChats)
	Mux.HandleFunc("/createPrivateChat", routes.CreatePrivateChat)
	Mux.HandleFunc("/getAllPrivateRooms", routes.GetAllPrivateRooms)
	Mux.HandleFunc("/getAllRequest", routes.GetAllRequest)
	Mux.HandleFunc("/acceptRequest", routes.AcceptRequest)
	Mux.HandleFunc("/rejectRequest", routes.RejectRequest)
	Mux.HandleFunc("/currentRoomDetails", routes.CurrentRoomDetails)

	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000","http://localhost:8080"},
		AllowedMethods: []string{
			http.MethodHead,
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
		},
		AllowedHeaders: []string{"*"},
		AllowCredentials: true,
		ExposedHeaders: []string{"X-CSRF-Token"},
	}).Handler(csrfMiddleware(limit(Mux)))

	s := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}
	
	
	
	log.Fatal(s.ListenAndServe())
}