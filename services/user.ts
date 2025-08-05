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

export const getUserById = async (id: string) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/get-user/id/${id.replace("@", "")}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    console.log(error, "error");
    return handleResp(error, "error");
  }
};
export const getTradeOverviewById = async (id: string) => {

  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/user-trade-overview/id/${id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getTradeOverview = async () => {

  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/user-trade-overview`,
      method: "get",
    });
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
      url: `${config.backendURL}/api/v1/user/trade-history/user/${data?.id}?page=${data.page}&limit=${data.limit}`,
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

export const getInfoCards = async () => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/info-cards`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const setUserEmailNotification = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/set-user-email-notification`,
      method: "post",
      data: data
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const setInAppNotification = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/set-in-app-notification`,
      method: "post",
      data: data
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const setWalletSettings = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/set-wallet-settings`,
      method: "post",
      data: data
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getWalletSettings = async () => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/get-wallet-settings`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getPositionsByEvtId = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/positions/event/${data?.id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "positionerror");
  }
};

export const getOpenOrdersByEvtId = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/open-orders/event/${data?.id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const addUserName = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/add-user-name`,
      method: "post",
      data: data
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const deleteComment = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/comments/${data?.id}`,
      method: "delete",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getCurrentValue = async () => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/current-value`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};


export const transactionHistory = async (data:any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/transaction-history`,
      method: "get",
      params: data,
    });
    if (data.export) {
      return handleResp(respData, "success");
    }
    return handleResp(respData, "success");
  } catch (err) {
    return handleResp(err, "error");
  }
}

export const getCoinList = async () => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/get-coin-list`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getNotifications = async () => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/notifications`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};