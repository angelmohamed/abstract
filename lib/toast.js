import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export function toastAlert(errorType, message, id) {
	if (errorType === "error") {
		toast.error(message, {
			autoClose: 7000,
			className: "custom-toast-error",
			toastId: id,
			position: "bottom-right",
			closeButton: false,
			theme: "colored",
		});
	} else if (errorType === "success") {
		toast.success(message, {
			autoClose: 7000,
			className: "success-toast custom-toast-success",
			toastId: id,
			position: "bottom-right",
			closeButton: false,
			theme: "colored",
		});
	}
}
