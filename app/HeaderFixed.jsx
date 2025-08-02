"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HamburgerMenuIcon,
  Cross1Icon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { Button } from "./components/ui/button";
import SearchComponent from "./components/customComponents/SearchComponent";
import { useSelector } from "@/store";
import { availableBalance, PnLFormatted, formatNumber } from "@/lib/utils";

export default function HeaderFixed() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { signedIn } = useSelector((state) => state?.auth?.session);
  const walletData = useSelector((state) => state?.wallet?.data);
  const navigateToPortfolioPage = () => router.push("/portfolio");

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen || isSearchOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isSearchOpen]);

  function formatNumber(num, decimals = 2) {
    if (typeof num !== "number") return "0.00";
    return num.toFixed(decimals);
  }

  function PnLFormatted(val) {
    // Example: add $ and green/red color
    return (
      <span className={val >= 0 ? "text-green-500" : "text-red-500"}>
        ${val}
      </span>
    );
  }

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black z-50 transition-opacity duration-500",
          isOpen || isSearchOpen
            ? "opacity-80 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
          setIsOpen(false);
          setIsSearchOpen(false);
        }}
      />

      {/* Side Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 w-[85vw] max-w-[320px] h-full bg-[#1F1F1F] z-[56] shadow-2xl transition-transform duration-500 ease-in-out will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close Button */}
        {/* <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button> */}

        {/* Menu Items */}

        {signedIn && (
          <div className="flex flex-col items-start gap-2 mt-4 mb-0 pl-3">
            <button
              className="px-3 py-2 text-left w-full"
              onClick={navigateToPortfolioPage}
            >
              <div className="text-xs text-grey">Cash</div>
              <div className="text-lg text-[#33ff4c]">
                ${availableBalance(walletData)}
              </div>
            </button>
            <button
              className="px-3 py-2 text-left w-full"
              onClick={() => navigateToPortfolioPage()}
            >
              <div className="text-xs text-grey">Portfolio</div>
              <div className="text-lg text-[#33ff4c]">
                {PnLFormatted(
                  formatNumber(walletData?.balance + walletData?.position, 2)
                )}
              </div>
            </button>
          </div>
        )}

        <nav className="flex flex-col gap-1 mt-1 px-2">
          {signedIn && (
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          )}
          <Link
            href="https://sonotrade.gitbook.io/sonotrade-docs/#overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
          >
            Beginner’s Guide
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            Waitlist
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            Terms of Use
          </Link>
        </nav>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          "fixed left-0 bottom-0 w-full h-[80vh] bg-[#181818] z-[56] rounded-t-2xl shadow-2xl transition-transform duration-500 ease-in-out will-change-transform",
          isSearchOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ minHeight: "300px" }}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#232b3a]">
          <span className="text-lg font-semibold text-white">Search</span>
          <button
            className="text-gray-400 hover:text-white text-2xl"
            onClick={() => setIsSearchOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="p-4">
          <SearchComponent />
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="h-16 flex justify-between items-center lg:hidden fixed bottom-0 w-full bg-black border-t border-[#1E1E1E] z-50 px-8 md:px-20">
        <Link
          href="/"
          className={cn(
            "w-9 h-9 flex flex-col items-center gap-1",
            activeMenu === "home" ? "text-white" : "text-gray-500"
          )}
          onClick={() => setActiveMenu("home")}
        >
          <HomeIcon className="text-3xl" />
          <span className="text-xs font-normal">Home</span>
        </Link>
        <button
          className="w-9 h-9 flex flex-col items-center gap-1 text-gray-500 hover:text-white focus:text-white"
          onClick={() => {
            setActiveMenu("search");
            setIsSearchOpen(true);
            setIsOpen(false);
          }}
        >
          <MagnifyingGlassIcon className="text-3xl" />
          <span className="text-xs font-normal">Search</span>
        </button>
        <Link
          href="/profile"
          className={cn(
            "w-9 h-9 flex flex-col items-center gap-1",
            activeMenu === "profile" ? "text-white" : "text-zinc-600"
          )}
          onClick={() => setActiveMenu("profile")}
        >
          <PersonIcon className="text-3xl" />
          <span className="text-xs font-normal">Profile</span>
        </Link>
        <button
          onClick={() => {
            setActiveMenu("more");
            setIsOpen(!isOpen);
            setIsSearchOpen(false);
          }}
          className="w-9 h-9 flex flex-col items-center gap-1 text-gray-500 hover:text-white focus:text-white"
        >
          {!isOpen ? (
            <HamburgerMenuIcon className="text-3xl" />
          ) : (
            <Cross1Icon className="text-3xl" />
          )}
          <span className="text-xs font-normal">More</span>
        </button>
      </div>
    </>
  );
}
