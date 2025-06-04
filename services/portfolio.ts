import config from "@/config/config";
import axios, { handleResp } from "@/config/axios";

export const getPositionHistory = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/position-history`,
        method: "post",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const getOpenOrders = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/open-position`,
        method: "get",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const getClosedPnL = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/closedPnL`,
        method: "get",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};
