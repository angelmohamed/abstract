"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Authentication from "./Authentication.jsx";
import SPECULATION from "@/public/images/logospec.png";

import { useSelector } from "@/store";
import { availableBalance } from "@/lib/utils";
import SearchComponent from "@/app/components/customComponents/SearchComponent";

export default function Header() {
  const router = useRouter();

  const { signedIn } = useSelector((state) => state?.auth?.session);
  const walletData = useSelector((state) => state?.wallet?.data);

  const navigateToPortfolioPage = () => router.push("/portfolio");

  return (
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent h-12 md:h-16 pt-1 md:pt-2 container mx-auto px-2 md:px-4 lg:px-0">
      {/* Logo and Mobile Auth */}
      <div className="flex items-center justify-between lg:ml-4 w-full lg:w-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={SPECULATION}
              alt="SPECULATION Logo"
              width={25}
              className="w-30 md:w-30"
              priority
            />
            <span className="font-bold text-xl pl-2">Speculation</span>
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Authentication />
        </div>
      </div>
      <div className="w-[576px] md:w-[750px] px-4 pb-2 md:pb-0 md:px-[2%] mt-1 md:mt-0 hidden lg:flex items-center">
        <SearchComponent />
        <Link
          href="https://sonotrade.gitbook.io/sonotrade-docs/#overview"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 text-black hover:text-grey-400 text-sm font-semibold px-3 py-1 rounded hover:text-gray-400 transition-colors whitespace-nowrap"
        >
          BUY $SPEC
        </Link>
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden lg:flex items-center gap-2 ml-auto pr-4">
        {signedIn && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToPortfolioPage}
          >
            <div className="text-l text-[#2fd900]">
              ${availableBalance(walletData)}
            </div>
            <div className="text-xs text-grey">Cash</div>
          </button>
        )}
        <Authentication />
      </div>
    </header>
  );
}