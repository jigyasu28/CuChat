import axios from "axios";

export const axiosInstance = axios.create({
	baseURL : "https://cuchatapp.herokuapp.com/api/"
})