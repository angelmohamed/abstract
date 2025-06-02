import config from "@/config/config";
import axios, { handleResp } from "@/config/axios";

export const userDeposit = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/user-deposit`,
        method: "post",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const addressCheck = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/address-check`,
        method: "post",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};