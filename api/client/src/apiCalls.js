import { axiosInstance } from "./config";

export const loginCall = async (userCredentials, dispatch) =>{
    dispatch({type: "LOGIN_START"});
    try{
        const res = await axiosInstance.post("auth/login", userCredentials)
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    }catch(err){
        dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });
    }
}


export const logoutCall = async (dispatch) =>{
    dispatch({ type: "LOGOUT_SUCCESS"});
}