import axios from "../config/axios";
import config from "../config/config";
import browser from "browser-detect";

var apiUrl = config.baseUrl;

export const register = async (data) => {
    try {
        let response = await axios({
            'method': 'post',
            'url': `${apiUrl}/register`,
            'data': data
        });
        console.log(response, 'responseee')
        return {
            status: (response && response.data && response.data.status) ? response.data.status : false,
            errors: (response && response.data && response.data.errors) ? response.data.errors : {},
            message: (response && response.data && response.data.message) ? response.data.message : "",
        }
    }
    catch (err) {
        return {
            status: false,
            errors: {},
            message: "Failed to register",
            authToken: null,
        }
    }
}

export const getUserLocation = async () => {
    try {
        let loginHistory = {};
        let respData = await axios({
            'method': "get",
            'url': config.getLoginInfo,
        });
        console.log("respDatarespData",respData)
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
        }
        console.log(loginHistory, 'loginHistory')
        return await loginHistory;
    } catch (err) {
        return null;
    }
};


export const verifyEmail = async (data) => {
    try {
        let response = await axios({
            'method': 'post',
            'url': `${apiUrl}/email-verify`,
            'data': data
        });
        console.log(response, 'responseee')
        return {
            status: (response && response.data && response.data.status) ? response.data.status : false,
            message: (response && response.data && response.data.message) ? response.data.message : "",
            authToken: (response && response.data && response.data.token) ? response.data.token : null,
        }
    }
    catch (err) {
        return {
            status: false,
            errors: {},
            message: "Failed to register",
        }
    }
}

export const resendOTP = async (data) => {
    try {
        let response = await axios({
            'method': 'post',
            'url': `${apiUrl}/resend-otp`,
            data: data
        });
        console.log(response, 'responseee')
        return {
            status: (response && response.data && response.data.status) ? response.data.status : false,
            message: (response && response.data && response.data.message) ? response.data.message : "",
        }
    }
    catch (err) {
        return {
            status: false,
            errors: {},
            message: "Failed to register",
        }
    }
}


export const googleLogin = async (data) => {
    console.log('datssssa: ', data);
    try {
        let response = await axios({
            'method': 'post',
            'url': `${apiUrl}/google-sign`,
            'data': data
        });
        console.log(response, 'responseee')
        return {
            status: (response && response.data && response.data.status) ? response.data.status : false,
            success: (response && response.data && response.data.success) ? response.data.success : false,
            errors: (response && response.data && response.data.errors) ? response.data.errors : {},
            authToken: (response && response.data && response.data.token) ? response.data.token : null,
            message: (response && response.data && response.data.message) ? response.data.message : "",
        }
    }
    catch (err) {
        return {
            status: false,
            errors: {},
            message: "Failed to register",
            authToken: null,
        }
    }
}

export const walletLogin = async (data) => {
    console.log('datssssa: ', data);
    try {
        let response = await axios({
            'method': 'post',
            'url': `${apiUrl}/wallet-sign`,
            'data': data
        });
        console.log(response, 'responseee')
        return {
            status: (response && response.data && response.data.status) ? response.data.status : false,
            authToken: (response && response.data && response.data.token) ? response.data.token : null,
            message: (response && response.data && response.data.message) ? response.data.message : "",
        }
    }
    catch (err) {
        return {
            status: false,
            errors: {},
            message: "Failed to register",
            authToken: null,
        }
    }
}
