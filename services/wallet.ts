import config from "@/config/config";
import axios, { handleResp } from "@/config/axios";
import { setWallet } from "@/store/slices/wallet/dataSlice";

export const userDeposit = async (data: any, dispatch: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/user/user-deposit`,
        method: "post",
        data,
      });
      const { wallet } = respData.data;
      dispatch(setWallet(wallet));
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