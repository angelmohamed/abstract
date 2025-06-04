// import packages
import axios from "axios";
import { getCookie } from "cookies-next";

// import lib
import config from "./config";

const isClient = typeof window !== "undefined";

axios.defaults.baseURL = config.baseUrl;

axios.interceptors.request.use(
  async (config) => {
    let authorizationToken = null;

    if (isClient) {
      authorizationToken = getCookie("user-token");
    } else {
      try {
        const { cookies } = await import("next/headers");
        const token = cookies().get("user-token");
        if (token) {
          authorizationToken = token.value;
        }
      } catch (error) {
        console.error("Error accessing server-side cookies:", error);
      }
    }

    if (authorizationToken) {
      config.headers.Authorization = `Bearer ${authorizationToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      console.log('respData.data: ', respData.data);

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
