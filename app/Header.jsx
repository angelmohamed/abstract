"use client"; // Add this at the top of the file to enable client-side hooks

import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/app/components/ui/SearchBar";
import SONOTRADE from "@/public/images/logo.png";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cross2Icon } from "@radix-ui/react-icons";
import { formatNumber } from "../app/helper/custommath.js";
import Authentication from "./Authentication.jsx";
import { useSelector } from "@/store";

export default function Header() {
  const router = useRouter();
  const { signedIn } = useSelector(state => state?.auth?.session);
  const walletData = useSelector(state => state?.wallet?.data);

  const [currentPosition, setCurrentPosition] = useState("$0.00");

  const navigateToPortfolioPage = () => {
    router.push("/portfolio");
    window.location.href = "/portfolio";
  };

  const [isSearchActive, setIsSearchActive] = useState(false);
  return (
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent md:h-16 h-auto pt-2 container mx-auto">
      <div className="flex w-full md:w-auto items-center justify-between p-0 md:ml-6 ml-0 overflow-hidden">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              src={SONOTRADE}
              alt="SONOTRADE Logo"
              width={265}
              className="w-48 pl-3 md:pl-0 sm:w-48 md:w-64"
              priority
            />
          </Link>
        </div>

        {/* Auth Buttons - Only on mobile/sm they appear next to logo */}
        <div className="flex md:hidden items-center gap-2 flex-shrink-0 pr-3">
          {signedIn && (
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
              onClick={navigateToPortfolioPage}
            >
              <div className="text-l" style={{ color: "#33ff4c" }}>
                {currentPosition}
              </div>
              <div className="text-xs text-grey">Portfolio</div>
            </button>
          )}
          <Authentication />
        </div>
      </div>

      {/* Search Bar - Now visible on all screen sizes as second row on mobile/sm */}
      <div className="w-full px-4 pb-2 md:pb-0 md:pl-[2%] md:pr-[2%] mt-1 md:mt-0">
        <div
          className="relative lg:max-w-[600px] min-w-[300px] sm:min-w-[400px]"
          tabIndex={-1}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setIsSearchActive(false)}
        >
          <SearchBar
            placeholder="Search markets"
            className={
              "w-full transition-all duration-150 outline-none " +
              (isSearchActive ? "rounded-t-lg rounded-b-none" : "rounded-lg")
            }
          />
          {isSearchActive && (
            <div className="absolute left-0 right-0 bg-[#070707] z-[156] rounded-b-lg border border-[#262626] border-t-0">
              <div className="flex flex-col gap-2 p-3">
                <div className="flex flex-col p-0 pb-2 lg:p-2 gap-2">
                  <p class="text-sm font-medium uppercase">Browse</p>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href="/"
                      className="py-1.5 rounded-lg border flex items-center gap-2 px-3 hover:bg-[#262626]"
                    >
                      <Image
                        src="/images/new_icon.png"
                        alt="Icon"
                        width={18}
                        height={18}
                      />
                      <span className="text-sm">New</span>
                    </Link>
                    <Link
                      href="/"
                      className="py-1.5 rounded-lg border flex items-center gap-2 px-3 hover:bg-[#262626]"
                    >
                      <Image
                        src="/images/trend_icon.png"
                        alt="Icon"
                        width={18}
                        height={18}
                      />
                      <span className="text-sm">Trending</span>
                    </Link>
                    <Link
                      href="/"
                      className="py-1.5 rounded-lg border flex items-center gap-2 px-3 hover:bg-[#262626]"
                    >
                      <Image
                        src="/images/popular_icon.png"
                        alt="Icon"
                        width={18}
                        height={18}
                      />
                      <span className="text-sm">Popular</span>
                    </Link>
                    <Link
                      href="/"
                      className="py-1.5 rounded-lg border flex items-center gap-2 px-3 hover:bg-[#262626]"
                    >
                      <Image
                        src="/images/timer_icon.png"
                        alt="Icon"
                        width={18}
                        height={18}
                      />
                      <span className="text-sm">Ending Soon</span>
                    </Link>
                    <Link
                      href="/"
                      className="py-1.5 rounded-lg border flex items-center gap-2 px-3 hover:bg-[#262626]"
                    >
                      <Image
                        src="/images/comp_icon.png"
                        alt="Icon"
                        width={18}
                        height={18}
                      />
                      <span className="text-sm">Competitive</span>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col p-0 pb-2 lg:p-2 gap-2">
                  <p class="text-sm font-medium uppercase">Recent</p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/"
                      className="py-2 rounded-lg border flex items-center gap-2 hover:bg-[#262626] justify-between pl-2 pr-3"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/album.png"
                          alt="Icon"
                          width={30}
                          height={30}
                          className="rounded"
                        />
                        <span className="text-sm">
                          Will the U.S. take over Gaza in 2025?
                        </span>
                      </div>
                      <button aria-label="Close" onMouseDown={e => e.preventDefault()}>
                        <Cross2Icon className="h-4 w-4" />
                      </button>
                    </Link>

                    <Link
                      href="/"
                      className="py-2 rounded-lg border flex items-center gap-2 hover:bg-[#262626] justify-between pl-2 pr-3"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src="/images/album.png"
                          alt="Icon"
                          width={30}
                          height={30}
                          className="rounded"
                        />
                        <span className="text-sm">Fed decision in July?</span>
                      </div>
                      <button aria-label="Close" onMouseDown={e => e.preventDefault()}>
                        <Cross2Icon className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Buttons - For md+ screens, keep their original position */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
        {signedIn && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToPortfolioPage}
          >
            <div className="text-l" style={{ color: "#33ff4c" }}>
              {walletData?.balance ? formatNumber(walletData?.balance, 4) : 0}
            </div>
            <div className="text-xs text-grey">Portfolio</div>
          </button>
          )
        }
        <Authentication />
      </div>
    </header>
  );
}
