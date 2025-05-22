// import packages
import axios from "axios";

// import lib
import config from "./config";

axios.defaults.baseURL = config.baseUrl;

let localtoken = localStorage.getItem("sonoTradeToken")

axios.defaults.headers.common["Authorization"] = localtoken ? localtoken : "";

export const setAuthToken = (token) => {
  axios.defaults.headers.common["Authorization"] = token;
};

export const removeAuthorization = () => {
  delete axios.defaults.headers.common["Authorization"];
};

export default axios;
