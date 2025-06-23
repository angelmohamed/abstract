import { Bounce, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export function toastAlert(errorType, message, id) {
  if (errorType === "error") {
    toast.error(message, {
      //   autoClose: 7000,
      //   className: "custom-toast-error",
      //   position: "bottom-right",
      //   closeButton: false,
      //   theme: "colored",
      toastId: id,
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  } else if (errorType === "success") {
    toast.success(message, {
      // autoClose: 7000,
      // className: "success-toast custom-toast-success",
      // position: "bottom-right",
      // closeButton: false,
      // theme: "colored",
      toastId: id,
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  }
}
