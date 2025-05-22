import isEmpty from "is-empty";

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
