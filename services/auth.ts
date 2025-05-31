import axios from "axios";
import config from "@/app/config/config";
import { handleResp, setAuthorization } from "@/app/config/axios";
import { signIn } from "@/store/slices/auth/sessionSlice";
import { setUser } from "@/store/slices/auth/userSlice";
import { setWallet } from "@/store/slices/wallet/dataSlice";
import { setAuthToken } from "@/lib/cookies";

export const register = async (data: any) => {
  try {
    let respData = await axios({
      method: "post",
      url: `${config.baseUrl}/register`,
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
      method: "post",
      url: `${config.baseUrl}/google-sign`,
      data: reqBody,
    });
    const { message, result } = respData.data;
    dispatch(signIn(result.token));
    dispatch(setUser(result.user));
    dispatch(setWallet(result.wallet));
    setAuthorization(result.token);
    setAuthToken(result.token);
    return {
      status: true,
      message,
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      status: false,
      loading: false,
      message: error.response.data.message,
      errors: error.response.data.errors,
    };
  }
};

export const walletLogin = async (reqBody: any, dispatch: any) => {
  try {
    let respData = await axios({
      method: "post",
      url: `${config.baseUrl}/wallet-sign`,
      data: reqBody,
    });
    const { message, result } = respData.data;
    dispatch(signIn(result.token));
    dispatch(setUser(result.user));
    dispatch(setWallet(result.wallet));
    setAuthorization(result.token);
    setAuthToken(result.token);
    return {
      status: "success",
      loading: false,
      message,
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      status: "failed",
      loading: false,
      message: error.response.data.message,
      errors: error.response.data.errors,
    };
  }
};

export const verifyEmail = async (reqBody: any, dispatch: any) => {
  try {
    let respData = await axios({
      method: "post",
      url: `${config.baseUrl}/email-verify`,
      data: reqBody,
    });
    const { message, result } = respData.data;
    dispatch(signIn(result.token));
    dispatch(setUser(result.user));
    dispatch(setWallet(result.wallet));
    setAuthorization(result.token);
    setAuthToken(result.token);
    return {
      status: "success",
      loading: false,
      message,
    };
  } catch (error: any) {
    console.log(error, "error");
    return {
      status: "failed",
      loading: false,
      message: error.response.data.message,
      errors: error.response.data.errors,
    };
  }
};
