import { axiosInstance } from "../../config";
import { useEffect, useRef, useState } from "react";
import "./register.css";
import { useNavigate } from "react-router"

import Alert from '@mui/material/Alert';
import { CircularProgress } from "@mui/material";

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

export default function Register() {
    const username = useRef();
    const email = useRef();
    const uid = useRef();
    const password = useRef();
    const confirmPassword = useRef();
    const navigate = useNavigate();

    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);

    const [checkUpper, setCheckUpper] = useState(false);
    const [checkLower, setCheckLower] = useState(false);
    const [checkNumber, setCheckNumber] = useState(false);

    const [pass, setPass] =useState('')

    useEffect(()=>{
        if(hasNumber(pass)){
            setCheckNumber(true);
        }else{
            setCheckNumber(false);
        }
        if(hasUpper(pass)){
            setCheckUpper(true);
        }else{
            setCheckUpper(false);
        }
        if(hasLower(pass)){
            setCheckLower(true);
        }else{
            setCheckLower(false);
        }
    }, [pass])

    const handleClick = async (e) =>{
        e.preventDefault();
        if(confirmPassword.current.value !== password.current.value){
            confirmPassword.current.setCustomValidity("Passwords don't match");
        }
        else if(checkLower === false || checkNumber==false || checkUpper===false){
            password.current.setCustomValidity("Please check your password format")
        }
        else{
            const user = {
                username: username.current.value,
                email: email.current.value,
                uid: uid.current.value,
                password: password.current.value,
            }

            try{
                setLoading(true)
                const res = await axiosInstance.post('/auth/register', user);
                navigate("/login");

            }catch(err){
                setErr(err.response?.data);
            }finally{
                setLoading(false);
            }

        }
    }

    const hasUpper = (string) =>{
        for(let i in string){
            if(string[i] === string[i].toUpperCase() && isNaN(string[i])){
                return true;
            }
        }
        return false;
    }

    const hasLower = (string) =>{
        for(let i in string){
            if(string[i] === string[i].toLowerCase() && isNaN(string[i])){
                return true;
            }
        }
        return false;
    }

    const hasNumber = (string) =>{
        for(let i in string){
            if(!isNaN(string[i])){
                return true;
            }
        }
        return false;
    }

    const toLogin = () =>{
        navigate("/login");
    }

    return (
    <div className="login">
        <div className="loginWrapper">
        <div className="loginLeft">
            <h3 className="loginLogo">Cuchat</h3>
            <span className="loginDesc">
            Connect with the seniors or juniors using CUChat
            </span>
        </div>
        <div className="loginRight">
            <form className="loginBox" onSubmit={handleClick}>
                {err ? 
                <Alert severity="error">{err}</Alert>
                :""}
                <input 
                    placeholder="Username" 
                    required 
                    className="loginInput" 
                    ref={username} 
                    minLength="3"
                />
                <input 
                    placeholder="Email" 
                    required 
                    className="loginInput" 
                    ref={email} 
                    type="email"
                />
                <input 
                    placeholder="UID" 
                    type="text" 
                    className="loginInput" 
                    ref={uid}
                    required
                    minLength="6"
                />
                <input 
                    placeholder="Password" 
                    required 
                    className="loginInput" 
                    ref={password}
                    onChange={(e)=>{
                        setPass(e.target.value)
                    }}
                    type="password"
                    minLength="6"
                />
                <div className="error-info">
                    <ul>
                    {checkUpper ?
                    <>
                    <li className="right"><DoneIcon fontSize="smallest"/><small>must contain Uppercase letters</small></li>
                    </>:
                    <>
                    <li className="wrong"><CloseIcon fontSize="smallest"/><small>must contain Uppercase letters</small></li>
                    </>
                    }


                    {checkLower ?
                    <>
                    <li className="right"><DoneIcon fontSize="smallest"/><small>must contain Lowercase letters</small></li>
                    </>:
                    <>
                    <li className="wrong"><CloseIcon fontSize="smallest"/><small>must contain Lowercase letters</small></li>
                    </>
                    }

                    {checkNumber ?
                    <>
                    <li className="right"><DoneIcon fontSize="smallest"/><small>must contain a numebr</small></li>
                    </>:
                    <>
                    <li className="wrong"><CloseIcon fontSize="smallest"/><small>must contain a number</small></li>
                    </>
                    }
                    </ul>
                </div>
                <input 
                    placeholder="Confirm Password" 
                    required 
                    className="loginInput" 
                    ref={confirmPassword} 
                    type="password"
                />
                
                {loading ? <div className="loginButton"><CircularProgress/></div>
                :<button className="loginButton" type="submit">Sign Up</button>
                }
                <button className="loginRegisterButton" onClick={toLogin}>
                    Log into Account
                </button>
            </form>
        </div>
        </div>
    </div>
    );
}