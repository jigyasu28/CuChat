import "./login.css";
import { useContext, useRef } from "react";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";

import Alert from '@mui/material/Alert';

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { user, isFetching, error, dispatch} = useContext(AuthContext)
  const navigate = useNavigate()

  const handleClick = (e) =>{
    e.preventDefault();
    loginCall({email: email.current.value, password: password.current.value}, dispatch);
  }

  const toRegister = () =>{
    navigate("/register")
  }

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">CUchat</h3>
          <span className="loginDesc">
            Connect with the seniors or juniors using CUChat
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            {error? 
            <Alert severity="error">{error}</Alert>: ""}
            <input 
              placeholder="Email" 
              type="email" 
              className="loginInput" 
              ref={email}
              required
            />
            <input 
              placeholder="Password" 
              type="password" 
              className="loginInput" 
              ref={password}
              required
              minLength="6"
            />
            <button className="loginButton" type="submit">
              {isFetching ? <CircularProgress color="primary" size='20px' className="login-loading" /> : "Login"}
            </button>
            <span className="loginForgot">Forgot Password?</span>
            <button className="loginRegisterButton" onClick={toRegister}>
              Create a New Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}