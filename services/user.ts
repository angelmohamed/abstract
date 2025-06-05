import config from "@/config/config";
import axios, { handleResp } from "@/config/axios";
import { setUser } from "@/store/slices/auth/userSlice";


export const getUserData = async (dispatch:any) => {

    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/get-user`,
        method: "get",
      });
      const { result } = respData.data;
      console.log("result>>>>>>>>>>.",result)
      dispatch(setUser(result));
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};


export const updateUserData = async (data:object) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/update-user`,
        method: "post",
        data: data
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const getPositions = async () => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/position-history`,
      method: "post",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getTradeHistory = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/trade-history/user/${data?.id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getUserTradeHistory = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/trade-history/${data?.id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};