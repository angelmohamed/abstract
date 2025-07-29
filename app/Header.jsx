"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Authentication from "./Authentication.jsx";
import SONOTRADE from "@/public/images/logo.png";

import { useSelector } from "@/store";
import { availableBalance } from "@/lib/utils";
import SearchComponent from "@/app/components/customComponents/SearchComponent";

export default function Header() {
  const router = useRouter();

  const { signedIn } = useSelector((state) => state?.auth?.session);
  const walletData = useSelector((state) => state?.wallet?.data);

  const navigateToPortfolioPage = () => router.push("/portfolio");

  return (
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent md:h-16 pt-2 container mx-auto">
      {/* Logo and Mobile Auth */}
      <div className="flex w-full lg:w-auto items-center justify-between md:ml-6">
        <Link href="/">
          <Image
            src={SONOTRADE}
            alt="SONOTRADE Logo"
            width={265}
            className="w-48 md:w-64 pl-3 md:pl-0"
            priority
          />
        </Link>

        <div className="flex lg:hidden items-center gap-2 pr-3">
          {/* {signedIn && (
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
              onClick={navigateToPortfolioPage}
            >
              <div className="text-l text-[#33ff4c]">
                ${availableBalance(walletData)}
              </div>
              <div className="text-xs text-grey">Cash</div>
            </button>
          )} */}
          <Authentication />
        </div>
      </div>
      <div className="w-full px-4 pb-2 md:pb-0 md:px-[2%] mt-1 md:mt-0 hidden lg:block">
        <SearchComponent />
      </div>
      <Link
        href="https://sonotrade.gitbook.io/sonotrade-docs/#overview"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-4 text-white text-sm font-semibold px-3 py-1 rounded hover:text-gray-400 transition-colors whitespace-nowrap hidden lg:block"
      >
        Beginner’s Guide
      </Link>

      {/* Desktop Auth Buttons */}
      <div className="hidden lg:flex items-center gap-2 ml-auto pr-3">
        {signedIn && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToPortfolioPage}
          >
            <div className="text-l text-[#33ff4c]">
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
