import React, { useEffect } from 'react';
import { BrowserRouter, Route, useHistory, Switch } from "react-router-dom"
import Login from "./Components/Login"
import Register from "./Components/Register"
import Home from "./Components/Home"
import Request from "./Components/Request"
import './App.css';

const Routing = () => {
    const history = useHistory()

    useEffect(() => {
      let user = localStorage.getItem("Token")
      if (!user) {
          if (history.location.pathname.startsWith("/home")) {
            history.push("/login")
          }
      } else {
        if (history.location.pathname === "/"){
          history.push(`/home/General/${user}`)
        }
        
      }
    },[])

    return (
      <Switch>
        <Route path="/" exact component={Login}/>
        <Route path="/register" component={Register}/>
        <Route path="/login" component={Login}/>
        <Route path="/home/:Room/:Token" component={Home}/>
        <Route path="/request/:Token" component={Request}/>
      </Switch>
    )
}

function App() {

  

  return (
    <BrowserRouter>
        <Routing/>
    </BrowserRouter>
  );
}

export default App;
