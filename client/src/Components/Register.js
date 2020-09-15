import React, {useEffect} from "react"
import {useHistory} from "react-router-dom"
import "../Styles/registerStyle.css"
import M from "materialize-css"

function Register() {

    const history = useHistory();

    useEffect(()=> {
            fetch("http://localhost:8080/getRegisterToken",{
                method : "GET",
                credentials : "include"
            }).then(response => document.getElementsByTagName("meta")["csrf"].setAttribute("content", response.headers.get("X-CSRF-Token")))
    })

    const loginpage = () => {
        history.push("/login")
    } 

    const submitHandler = (e) =>{
        e.preventDefault()

        if (e.target[0].value === "" || e.target[1].value === "" || e.target[2].value === "") {
            M.toast({html: "No Empty Fields", classes: "red-toast"})
            return
        }

        if (e.target[0].value.length > 15 || e.target[1].value.length > 30 || e.target[2].value.length > 20) {
            M.toast({html: "Something wrong with fields", classes: "red-toast"})
            return
        }

        const details = {
            Name : e.target[0].value,
            Email : e.target[1].value,
            Password : e.target[2].value
        }
        console.log(document.getElementsByTagName("meta")["csrf"].getAttribute("content"))
        fetch("http://localhost:8080/register",{
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "X-CSRF-Token" : document.getElementsByTagName("meta")["csrf"].getAttribute("content")
            },
            credentials : "include",
            body : JSON.stringify(details)
        }).then(response => response.json())
        .then(data=>{
            if (data.Result === "success"){
                history.push("/login")
                M.toast({html: "Registration Successful", classes: "green-toast"})
            } else {
                M.toast({html: data.Result, classes: "red-toast"})
            }
        })
    }

    return (
        <div className="container">
            <div className="left-side1">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="ghost" id="signIn" onClick={()=>loginpage()}>Sign In</button>
            </div>
            <div className="right-side1">
                <form onSubmit={(e)=>submitHandler(e)}>
                    <h1>Sign up</h1>
                    <div className="spacing"></div>
                    <input type="text" placeholder="Name"/>
                    <input type="email" placeholder="Email"/>
                    <input type="password" placeholder="Password"/>
                    <div className="spacing"></div>
                    <button>Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default Register