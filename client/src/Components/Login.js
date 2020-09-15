import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import "../Styles/loginStyles.css"
import M from "materialize-css"

function Login() {

    const history = useHistory()
    useEffect(() => {
        fetch("http://localhost:8080/getToken", {
            method : "GET",
            credentials : "include"
        }).then(response => document.getElementsByTagName("meta")["csrf"].setAttribute("content", response.headers.get("X-CSRF-Token")))
        //.then(response => console.log(response.headers.get("X-CSRF-Token")))
    },[])

    const registerPage = () => {
        
        localStorage.clear()
        history.push("/register")

    }

    const submitHandler = (e) => {
        e.preventDefault()
        const details = {
            Email : e.target[0].value,
            Password : e.target[1].value
        }

        if (details.Email === "" || details.Password === "") {
            M.toast({html: "No empty fields", classes: "red-toast"})
            return
        }

        if (details.Email.length > 30 || details.Password.length > 20) {
            M.toast({html: "Something wrong with your fields", classes: "red-toast"})
            return
        }
        console.log(document.getElementsByTagName("meta")["csrf"].getAttribute("content"))
        fetch("http://localhost:8080/login",{
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "X-CSRF-Token" : document.getElementsByTagName("meta")["csrf"].getAttribute("content")
            },
            credentials : "include",
            body : JSON.stringify(details)
        }).then(response =>response.json())
        .then(data=>{
            if (data.Result !== "Email/Password is Wrong"){
                localStorage.setItem(`Token`, data.Token)
                localStorage.setItem(`Details` , JSON.stringify({name : data.Name, email : data.Email}))
                localStorage.setItem("currentChannel", "General")
                M.toast({html: "Successfully logged in", classes: "green-toast"})
                history.push(`/home/General/${data.Token}`)
            } else {
                M.toast({html: data.Result, classes: "green-toast"})
            }
        })

    }

    return (
        <div className="container">
            <div className="left-side">
                <form onSubmit={(e)=>submitHandler(e)}>
                    <h1>Sign in</h1>
                    <div className="spacing"></div>
                    <input type="email" placeholder="Email"/>
                    <input type="password" placeholder="Password"/>
                    <div className="spacing"></div>
                    <button>Sign In</button>
                </form>
            </div>
            <div className="right-side">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start chatting with the world!!!</p>
                <button id="signUp" onClick={()=>registerPage()}>Sign Up</button>
            </div>
        </div>
    )
}

export default Login