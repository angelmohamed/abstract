import localFont from "next/font/local";
import "./globals.css";
import { WalletProvider } from "@/app/walletconnect/walletContext";
import SnackbarClient from "@/app/helper/SnackbarClient";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";
import { StoreProvider } from "@/providers/store-provider";
import ClientLayoutEffect from "./ClientLayoutEffect";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "SONOTRADE",
  description: "The Music Stock Market",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Sonotrade</title>
        <meta name="description" content="The Music Stock Market" />
        <meta itemProp="name" content="Sonotrade" />
        <meta itemProp="description" content="The Music Stock Market" />
        <meta
          itemProp="image"
          content="https://www.sonotrade.co/images/SONOTRADE.png"
        />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>
          <SnackbarClient>
         <ClientLayoutEffect />
            <WalletProvider>{children}</WalletProvider>
          </SnackbarClient>
        </StoreProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
