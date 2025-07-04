import isEmpty from "is-empty";
import { isAddress } from "../helper/custommath"

export const regValidate = async (params) => {
    let errors = {}
    let emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;
   
    if (isEmpty(params.email)) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(params.email)) {
        errors.email = "Email is invalid";
    } 

    return errors;
}

export const regInputValidate = (params, name) => {
    let errors = {}
    let emailRegex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,6}))$/;

    if (isEmpty(params.email) && name === "email") {
        errors.email = "Email is required";
    } else if (!emailRegex.test(params.email) && name === "email") {
        errors.email = "Email is invalid";
    }
  
    return errors;
}


export const otpValidate = async (params) => {
    let errors = {}

    if (isEmpty(params.otp)) {
        errors.otp = "OTP is required";
    } else if (isNaN(params.otp)) {
        errors.otp = "invalid OTP";
    }

    return errors;
}

export const otpInputValidate = (params, name) => {
    let errors = {}

    if (isEmpty(params.otp) && name == 'otp') {
        errors.otp = "OTP is required";
    } else if (isNaN(params.otp) && name == 'otp') {
        errors.otp = "invalid OTP";
    }

    return errors;
}


export const withdrawValidate = async (params) => {
    let errors = {}

    if (isEmpty(params.userAddress)) {
        errors.userAddress = "Address is required";
    }else if(!isAddress(params.userAddress)){
        errors.userAddress = "Invalid Address";
    }

    if (isEmpty(params.amount)) {
        errors.amount = "Amount is required";
    } else if (isNaN(params.amount)) {
        errors.amount = "Invalid amount";
    }


    return errors;
}

export const withdrawInputValidate = (params, name) => {
    let errors = {}

    if (isEmpty(params.userAddress) && name == 'userAddress') {
        errors.userAddress = "Address is required";
    } else if(!isAddress(params.userAddress) && name == 'userAddress' ){
        errors.userAddress = "Invalid Address";
    }

    if (isEmpty(params.amount) && name == 'amount') {
        errors.amount = "Amount is required";
    } else if (isNaN(params.amount) && name == 'amount') {
        errors.amount = "Invalid amount";
    }


    return errors;
}
