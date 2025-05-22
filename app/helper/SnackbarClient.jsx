"use client";

import { SnackbarProvider } from "notistack";

export default function SnackbarClient({ children }) {
    return (
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
            {children}
        </SnackbarProvider>
    );
}
