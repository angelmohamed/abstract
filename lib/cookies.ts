import { setCookie, getCookie } from "cookies-next";

export const setAuthToken = async (token: any) => {
    setCookie("user-token", token, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });
};

export const getAuthToken = () => {
    return getCookie("user-token");
};

export const removeAuthToken = () => {
    // cookies.remove("user-token", { path: "/" });
};