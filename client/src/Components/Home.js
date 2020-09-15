import React, { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import io from "socket.io-client"
import "../Styles/homeStyle.css"
import jwt_decode from "jwt-decode"
import M from "materialize-css"

function Home() {

    const [messages, setMessages] = useState([])
    const [rooms, setRooms] = useState([])
    const [privaterooms, setPrivate] = useState([])
    const [allPrivateRooms, setAllPrivate] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [people, setPeople] = useState([])
    const [receiver, setReceiver] = useState([])
    const [sender, setSender] = useState([])
    const { Room, Token } = useParams();
    const userName = jwt_decode(Token).user
    const userEmail = jwt_decode(Token).email
    const domain = jwt_decode(Token).email.split("@")[1]
    const currentChannel = localStorage.getItem("currentChannel")
    const [classname, setClassname] = useState("")
    const history = useHistory();

    const socket = io('ws://localhost:8080', {transports: ['websocket']});

    const logoutHandler = () => {

        localStorage.clear()
        M.toast({html: "Logged Out", classes: "green-toast"})
        history.push("/login")

    }

    const getReceiver = () => {
        fetch(`http://localhost:8080/getReceiverChats?username=${userName}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            setReceiver(data)
        })
    }

    const getSender = () => {
        fetch(`http://localhost:8080/getSenderChats?username=${userName}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            setSender(data)
        })
    }

    const getUsers = () => {
        fetch(`http://localhost:8080/getAllPeople?domain=${domain}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            setPeople(data)
        })
    }


    const fetchMessages = () =>{
        fetch(`http://localhost:8080/getAllMessage?Roomname=${Room}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            setMessages(data)
        })
    }

    const fetchPublicRooms = () => {
        fetch(`http://localhost:8080/getAllPublicRoom`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            setRooms(data)
        })
    }

    const currentRoomDetail = () => {
        fetch(`http://localhost:8080/currentRoomDetails?roomname=${Room}&username=${userName}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            console.log(data)
            console.log(data ? data.length > 0 ?data[0].privilege === "Read Only" && data[0].status !== "Admin" ? "restrict" : "" : "" :"loading")
            setClassname(data ? data.length > 0 ?data[0].privilege === "Read Only" && data[0].status !== "Admin" ? "restrict" : "" : "" :"loading")
        })
    }

    const fetchPrivateRooms = () => {
        fetch(`http://localhost:8080/getAllPrivateRoom?username=${userName}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            setPrivate(data)
        })
    }

    const fetchAllPrivateRooms = () => {
        fetch(`http://localhost:8080/getAllPrivateRooms`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            var rooms = data.map(room => room.roomname)
            console.log([...new Set(rooms)])
            setAllPrivate([...new Set(rooms)])
        })
    }

    const fetchHomeToken = () => {
        fetch("http://localhost:8080/getHomeToken",{
            method : "GET",
            credentials : "include"
        }).then(response => document.getElementsByTagName("meta")["csrf"].setAttribute("content", response.headers.get("X-CSRF-Token")))
    }

    useEffect(() => {
        fetchHomeToken()
        //console.log(document.getElementsByTagName("meta")["csrf"].getAttribute("content"))
        fetchMessages()
        fetchPublicRooms()
        fetchPrivateRooms()
        fetchAllPrivateRooms()
        currentRoomDetail()
        getUsers()
        getReceiver()
        getSender()
        
        socket.on('connect', function () {
            console.log('Welcome User');
        });

        socket.emit("joinChannel", Room);

        socket.on("message",(data) => {
            window.location.reload()
        })

    },[])

    const messageHandler = (e) => {
        e.preventDefault()
        const details = {
            Roomname : Room,
            User : userName,
            Message : e.target[0].value
        }
        socket.emit("message", details)
    }

    const swapRoom = (e, flag) =>{
        if (!flag) {
            setMessages([])
            const roomSwap = {
                oldRoom : Room,
                newRoom : e.target.innerText
            }
            localStorage.setItem("currentChannel", e.target.innerText)
            socket.emit("swapChannel", roomSwap)
            history.push(`/home/${e.target.innerText}/${Token}`)
            window.location.reload()
        } else {
            var newRoomName = (userName+e.target.innerText).split("").sort().join("")
            setMessages([])
            const roomSwap = {
                oldRoom : Room,
                newRoom : newRoomName
            }
            localStorage.setItem("currentChannel", e.target.innerText)
            socket.emit("swapChannel", roomSwap)
            history.push(`/home/${newRoomName}/${Token}`)
            window.location.reload()
        }
        
    }

    const createPublicRoom = () => {
        const roomname = document.getElementById("roomname").value;
        if (roomname !== "") {
            fetch(`http://localhost:8080/createPublicRoom`,{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-Token" : document.getElementsByTagName("meta")["csrf"].getAttribute("content")
                },
                credentials : "include",
                body : JSON.stringify({name : roomname})
            }).then(response => response.json()
            ).then(data => {
                if (data.Result === "success") {
                    M.toast({html: "Room added", classes: "green-toast"})
                    window.location.reload()
                } else {
                    M.toast({html: data.Result, classes: "red-toast"})
                }
            })
        }
    }

    const createPrivateRoom = (e) => {
        const roomname = document.getElementById("p-roomname").value;
        let privilege_value = true
        const privilege = document.getElementsByName("privilege");
        if (privilege[0].checked) {
            privilege_value = "Read Only"
        } else {
            privilege_value = "Read and Write"
        }
        if (roomname !== "") {
            fetch(`http://localhost:8080/createPrivateRoom`,{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-Token" : document.getElementsByTagName("meta")["csrf"].getAttribute("content")
                },
                credentials : "include",
                body : JSON.stringify({username : userName,
                    roomname : roomname,
                    admin : userEmail,
                    status : "Admin",
                    privilege: privilege_value
                })
            }).then(response => response.json()
            ).then(data => {
                if (data.Result === "success") {
                    M.toast({html: "Room added", classes: "green-toast"})
                    window.location.reload()
                } else {
                    M.toast({html: data.Result, classes: "red-toast"})
                }
            })
        }
    }

    const joinRoom = () => {
        const joinroom = document.getElementById("joinRoom").value
        fetch(`http://localhost:8080/joinPrivateRoom`,{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-Token" : document.getElementsByTagName("meta")["csrf"].getAttribute("content")
                },
                credentials : "include",
                body : JSON.stringify({username : userName,
                    roomname : joinroom
                })
            }).then(response => response.json()
            ).then(data => {
                if (data.Result === "success") {
                    M.toast({html: "Room added", classes: "green-toast"})
                    window.location.reload()
                } else {
                    M.toast({html: data.Result, classes: "red-toast"})
                }
                
            })
    }

    const addPrivateChat = (e) => {
        const receiver = e.target.innerText;
        if (receiver !== "") {
            fetch(`http://localhost:8080/createPrivateChat`,{
                method : "POST",
                headers : {
                    "Content-Type" : "application/json",
                    "X-CSRF-Token" : document.getElementsByTagName("meta")["csrf"].getAttribute("content")
                },
                credentials : "include",
                body : JSON.stringify({ sender : userName,
                    roomname : (userName+receiver).split("").sort().join(""),
                    receiver : receiver
                })
            }).then(response => response.json()
            ).then(data => {
                if (data.Result === "success") {
                    M.toast({html: "Room added", classes: "green-toast"})
                    window.location.reload()
                } else {
                    M.toast({html: data.Result, classes: "red-toast"})
                }
            })
        }
    }

    const onTextChange = (e) => {
        const value = e.target.value;
        let suggestion = []
        if (value.length > 0) {
            const regex = new RegExp(`^${value}`, 'i')
            suggestion = allPrivateRooms.sort().filter(v => regex.test(v))
        }
        setSuggestions(suggestion)
    }

    return (
        <>
            <nav>
                <div className="nav-wrapper">
                <a href="" className="brand-logo">ChAtSoN</a>
                <ul className="right">
                    <li><a href={`/request/${Token}`}>Request</a></li>
                    <li><p onClick={()=>logoutHandler()} className="waves-effect waves-light btn logoutBtn">Logout</p></li>
                </ul>
                </div>
            </nav>
            <div className="home-container">
                <div className="left">
                    <h4>Hello! <span>{userName.charAt(0).toUpperCase()+userName.slice(1)}</span></h4>
                    <hr/>
                    <div className="public-rooms">
                        <div className="room-title">
                            <h5>Public Rooms</h5>
                            <i class="material-icons" onClick={() =>{
                                document.querySelector(".public-model").style.visibility = "visible";
                            }}>add_box</i>
                        </div>
                        
                        <div className="collection">
                            {
                                rooms ? (
                                    rooms.map(room => {
                                        return (
                                            <p className="collection-item" onClick={(e) => swapRoom(e, false)}>{room.name}</p>
                                        )
                                    })
                                ) : (
                                    <h5>Loading...</h5>
                                )
                            }
                            
                        </div>
                    </div>
                    <hr/>
                    <div className="private-rooms">
                        <div className="room-title">
                            <h5>Private Rooms</h5>
                            <h6 onClick={() =>{
                                document.querySelector(".join-model").style.visibility = "visible";
                            }}>Join</h6>
                            <i class="material-icons" onClick={() =>{
                                document.querySelector(".private-model").style.visibility = "visible";
                            }}>add_box</i>
                        </div>
                        <div className="collection">
                            {
                                rooms ? (
                                    privaterooms.map(room => {
                                        return (
                                            <p className="collection-item" onClick={(e) => swapRoom(e, false)}>{room.roomname}</p>
                                        )
                                    })
                                ) : (
                                    <h5>Loading...</h5>
                                )
                            }
                            
                        </div>
                    </div>
                    
                </div>
                <div className="right-box">
                    <div className="room-heading">
                        <h6>Room : {currentChannel}</h6>
                    </div>
                    <div className="message-box">
                    {
                        messages ? (
                            messages.length > 0 ? (
                                messages.map(message =>{
                                    return (
                                        <div key={message.message}>
                                            <div className="message">
                                                <h6>{message.user.charAt(0).toUpperCase()+message.user.slice(1)}</h6>
                                                <p>{message.message}</p>
                                            </div>
                                            <div className="spacingg"></div>
                                        </div>
                                        
                                    )
                                })
                            ): (
                                <h5>Welcome To the Room...</h5>
                            )
                                
                        ) : (
                            <h4>Loading...</h4>
                        )
                    }
        
                    </div>
                    <div className="enterMessage">
                        <form onSubmit={(e)=>messageHandler(e)}>
                            <h6>Enter Message:</h6>
                            <input type="text" placeholder="Enter your message and hit enter" className={classname}/>
                        </form>
                    </div>
                </div>
                <div className="right-sub">
                    <div className="chats">
                        <h5>Private Chats</h5>
                        <i class="material-icons" onClick={() =>{
                            document.querySelector(".peoples-model").style.visibility = "visible";
                        }}>add_box</i>
                    </div>
                    <hr/>
                    <div className="collection">
                    {
                        sender ? (
                            sender.map(room => {
                                return (
                                    <p className="collection-item" onClick={(e) => swapRoom(e, true)}>{room.receiver}</p>
                                )
                            })
                        ) : (
                            <h5>Loading...</h5>
                        )
                    }
                    {
                        receiver ? (
                            receiver.map(room => {
                                return (
                                    <p className="collection-item" onClick={(e) => swapRoom(e, true)}>{room.sender}</p>
                                )
                            })
                        ) : (
                            <h5>Loading...</h5>
                        )
                    }
                    </div>
                </div>
                <div className="public-model">
                    <div className="p-container">
                        <div className="p-sub">
                            <h5>Enter Room Name</h5>
                            <i class="material-icons" onClick={() => {
                                document.querySelector(".public-model").style.visibility = "hidden";
                            }}>close</i>
                        </div>
                        
                        <input type="text" placeholder="Room Name" id="roomname"/>
                        <button onClick={(e)=>createPublicRoom()}>Create Room</button>
                    </div>
                </div>
                <div className="private-model">
                    <div className="p-container">
                        <div className="p-sub">
                            <h5>Enter Room Name</h5>
                            <i class="material-icons" onClick={() => {
                                document.querySelector(".private-model").style.visibility = "hidden";
                            }}>close</i>
                        </div>
                        
                        <input type="text" placeholder="Room Name" id="p-roomname"/>
                        <h5>Privilege</h5>
                        <div className="privilege">
                            <p>
                                <label>
                                <input className="with-gap" name="privilege" type="radio" checked />
                                <span>Read Only</span>
                                </label>
                            </p>
                            <p>
                                <label>
                                <input className="with-gap" name="privilege" type="radio" />
                                <span>Read and Write</span>
                                </label>
                            </p>
                        </div>
                        <button onClick={(e)=>createPrivateRoom()}>Create Room</button>
                    </div>
                </div>
                <div className="join-model">
                    <div className="p-container">
                        <div className="p-sub">
                            <h5>Enter Room Name</h5>
                            <i class="material-icons" onClick={() => {
                                document.querySelector(".join-model").style.visibility = "hidden";
                            }}>close</i>
                        </div>
                        
                        <input type="text" placeholder="Room Name" id="joinRoom" onChange={(e) => onTextChange(e)}/>
                        <ul class="suggestion">
                            {
                                suggestions ? (
                                    suggestions.map(v => {
                                        return (
                                            <li onClick={(e) => { 
                                                document.getElementById("joinRoom").value = e.target.innerText;
                                                setSuggestions([])
                                            }}>{v}</li>
                                        )
                                        })
                                ) : <></>
                            }
                        </ul>
                        <br/>
                        <button onClick={(e)=>joinRoom()}>Join Room</button>
                    </div>
                </div>
                <div className="peoples-model">
                    <div className="people-container">
                        <div className="t-people">
                            <h4>People</h4>
                            <i class="material-icons" onClick={() => {
                                document.querySelector(".peoples-model").style.visibility = "hidden";
                            }}>close</i>
                        </div>
                        
                        <div className="collection c-people">
                            {
                                people ? (
                                    people.length > 0 ? (
                                        people.map(peoplee => {
                                            return (
                                                <p className="collection-item" onClick={(e) => addPrivateChat(e)}>{peoplee.name}</p>
                                            )
                                        })
                                    ) : <h6>No people on your domain</h6>
                                ) : <h4>Loading...</h4>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}

export default Home;