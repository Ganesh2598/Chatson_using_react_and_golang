import React, { useState, useEffect } from "react"
import { useParams, useHistory } from "react-router-dom"
import jwt_decode from "jwt-decode"
import "../Styles/requestStyle.css"

function Request() {

    const history = useHistory()
    const [request, setRequest] = useState([])
    const { Token } = useParams()
    const email = jwt_decode(Token).email
    console.log(email)

    useEffect(() => {
        fetch(`http://localhost:8080/getAllRequest?email=${email}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            console.log(data)
            setRequest(data)
        })
    },[])

    const acceptRequest = (username) => {
        fetch(`http://localhost:8080/acceptRequest?username=${username}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            if (data) {
                history.push(`/home/General/${Token}`)
            }
        })
    }

    const rejectRequest = (username) => {
        fetch(`http://localhost:8080/rejectRequest?username=${username}`,{
            method : "GET"
        }).then(response => response.json()
        ).then(data => {
            if (data) {
                history.push(`/home/General/${Token}`)
            }
        })
    }

    return (
        <div className="request-container">
            <div className="requests">
                
                    {
                        request ? (
                            request.length > 0 ? (
                                request.map(req => {
                                    return (
                                        <div className="single-request">
                                            <div>
                                                <h5>ROOM NAME : <span>{req.name}</span> </h5>
                                                <h6>Request-from : <span>{req.from}</span></h6>
                                            </div>
                                            <div className="result">
                                                <button className="accept-button" onClick={()=>acceptRequest(req.from)}>Accept</button>
                                                <br/>
                                                <button className="reject-button" onClick={()=>rejectRequest(req.from)}>Reject</button>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : <h4>No Request Found</h4>
                        ) : <h5>Loading...</h5>
                    }
            </div>
        </div>
    )
}

export default Request