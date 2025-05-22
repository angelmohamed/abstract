"use client";
import { enqueueSnackbar, closeSnackbar } from 'notistack';

export function toastAlert(errorType, message, id) {

    if (errorType == 'error') {

        enqueueSnackbar(message, {
            variant: 'error',
            autoHideDuration: 2500,
            maxSnack: 1,
            anchorOrigin: { horizontal: "right", vertical: "top" },
            preventDuplicate: true
        })

    } else if (errorType == 'success') {
        enqueueSnackbar(message, {
            variant: 'success',
            autoHideDuration: 2500,
            maxSnack: 1,
            anchorOrigin: { horizontal: "right", vertical: "top" },
            preventDuplicate: true

        })
    }
}