// import packages
import axios from "axios";

// import lib
import config from "./config";

axios.defaults.baseURL = config.baseUrl;

let localtoken = localStorage.getItem("sonoTradeToken")

axios.defaults.headers.common["Authorization"] = localtoken ? `Bearer ${localtoken}` : "";

export const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = token;
};

export const removeAuthorization = () => {
  delete axios.defaults.headers.common["Authorization"];
};

export const handleResp = (respData, type = 'success', doc) => {
  try {
    if (doc === true && type == 'success' && respData && respData.data) {
      return { data: respData.data }
    }
    if (type == 'success' && respData && respData.data) {
      return respData.data
    } else if (type == 'error' && respData && respData.response && respData.response.data) {
      return respData.response.data
    } else {
      return {
        success: false,
        message: 'Something went wrong',
      }
    }
  } catch (err) {
    return {
      success: false,
      message: 'Something went wrong',
    }
  }
}

export default axios;
