"use client";
import { useSnackbar } from "notistack";

export function useToast() {
    const { enqueueSnackbar } = useSnackbar();

    return (errorType, message) => {
        enqueueSnackbar(message, {
            variant: errorType,
            autoHideDuration: 2500,
            anchorOrigin: { horizontal: "right", vertical: "top" },
            preventDuplicate: true,
        });
    };
}
