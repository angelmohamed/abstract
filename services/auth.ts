import axios from "axios";
import browser from "browser-detect";

import config from "@/config/config";
import { handleResp, setAuthorization } from "@/config/axios";
import { signIn } from "@/store/slices/auth/sessionSlice";
import { setUser } from "@/store/slices/auth/userSlice";
import { setWallet } from "@/store/slices/wallet/dataSlice";
import { setAuthToken } from "@/lib/cookies";

export const register = async (data: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/register`,
      method: "post",
      data,
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const googleLogin = async (reqBody: any, dispatch: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/google-sign`,
      method: "post",
      data: reqBody,
    });
    const { message, result } = respData.data;
    dispatch(signIn(result.token));
    dispatch(setUser(result.user));
    dispatch(setWallet(result.wallet));
    setAuthorization(result.token);
    setAuthToken(result.token);
    return {
      success: true,
      message,
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      success: false,
      message: error?.response?.data?.message,
      errors: error?.response?.data?.errors,
    };
  }
};

export const walletLogin = async (reqBody: any, dispatch: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/wallet-sign`,
      method: "post",
      data: reqBody,
    });
    const { message, result } = respData.data;
    dispatch(signIn(result?.token));
    dispatch(setUser(result?.user));
    dispatch(setWallet(result?.wallet));
    setAuthorization(result?.token);
    setAuthToken(result?.token);
    return {
      success: true,
      message,
      result
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      success: false,
      message: error?.response?.data?.message,
      errors: error?.response?.data?.errors,
    };
  }
};

export const verifyEmail = async (data: any, dispatch: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/email-verify`,
      method: "post",
      data,
    });
    const { message, result } = respData.data;
    dispatch(signIn(result.token));
    dispatch(setUser(result.user));
    dispatch(setWallet(result.wallet));
    setAuthorization(result.token);
    setAuthToken(result.token);
    return {
      success: true,
      message,
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      success: false,
      message: error?.response?.data?.message,
      errors: error?.response?.data?.errors,
    };
  }
};

export const getLocation = async () => {
  try {
    let loginHistory: any = {};
    let respData: any = await axios({
      url: config.getLoginInfo,
      method: "get",
    });
    if (respData) {
      const browserRes = browser();
      respData = respData?.data;
      loginHistory.countryName = respData.countryName;
      loginHistory.countryCode = respData.countryCode;
      loginHistory.ipaddress = respData.ipAddress;
      loginHistory.region = respData.regionName;
      loginHistory.country_code = respData.country_code;
      loginHistory.timezone = respData.timeZones;
      loginHistory.country_capital = respData.country_capital;
      loginHistory.city = respData.cityName;
      loginHistory.country = respData.countryName;
      loginHistory.broswername = browserRes.name;
      loginHistory.ismobile = browserRes.mobile;
      loginHistory.os = browserRes.os;
      return loginHistory;
    }
    return false;
  } catch (err) {
    return false;
  }
};

export const resendOTP = async (data: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/resend-otp`,
      method: "post",
      data,
    });
    return handleResp(respData, "success");
  } catch (error) {
    return handleResp(error, "error");
  }
};

export const getUser = async () => {
  try {
    let respData = await axios({
      method: "get",
      url: `${config.backendURL}/api/v1/user/get-user`,
    });
    return handleResp(respData, "success");
  } catch (error) {
    return handleResp(error, "error");
  }
};


