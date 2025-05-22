import localFont from "next/font/local";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { client } from "@/app/client";
import { Footer } from "@/app/components/customComponents/Footer";
import { WalletProvider } from '@/app/walletconnect/walletContext';


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
        {/* Default Metadata */}
        <title>Sonotrade</title>
        <meta name="description" content="The Music Stock Market" />

        {/* Google Structured Data */}
        <meta itemProp="name" content="Sonotrade" />
        <meta itemProp="description" content="The Music Stock Market" />
        <meta
          itemProp="image"
          content="https://www.sonotrade.co/images/SONOTRADE.png"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThirdwebProvider>
          <WalletProvider>
              {children}
          </WalletProvider>
        </ThirdwebProvider>
        <Footer />
      </body>
    </html>
  );
}
