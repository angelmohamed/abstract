import config from "@/config/config";
import axios, { handleResp } from "@/config/axios";

export const getEvents = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/events/paginate/${data.id}?page=${data.page}&limit=${data.limit}&banner=${data.banner}&tag=${data.tag}`,
        method: "get",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const getCategories = async () => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/events/category`,
        method: "get",
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const getEventById = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/events/market/${data.id}`,
        method: "get",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const placeOrder = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/order`,
        method: "post",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const cancelOrder = async (id: string) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/order/cancel/${id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getOrderBook = async (data: any) => {
    try {
      let respData = await axios({
        url: `${config.backendURL}/api/v1/order/books/${data.id}`,
        method: "get",
        data,
      });
      return handleResp(respData, "success");
    } catch (error: any) {
      return handleResp(error, "error");
    }
};

export const getPriceHistory = async (id: string, params: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/events/price-history/${id}`,
      method: "get",
      params,
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

//get comments
export const getComments = async (eventId: string) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/comments/event/${eventId}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const postComment = async (data: any) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/user/comments`,
      method: "post",
      data,
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
};

export const getTagsByCategory = async (id: string) => {
  try {
    let respData = await axios({
      url: `${config.backendURL}/api/v1/events/tags/${id}`,
      method: "get",
    });
    return handleResp(respData, "success");
  } catch (error: any) {
    return handleResp(error, "error");
  }
}