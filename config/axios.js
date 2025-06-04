// import packages
import axios from "axios";

// import lib
import config from "./config";
import { getCookie } from "cookies-next";

axios.defaults.baseURL = config.baseUrl;

const token = getCookie("user-token");

axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` :"";

export const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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
