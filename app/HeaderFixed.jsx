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

export default function HeaderFixed() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("home");
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black z-50 transition-opacity duration-500",
          isOpen
            ? "opacity-80 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 w-[85vw] max-w-[320px] h-full bg-[#1F1F1F] z-50 shadow-2xl transition-transform duration-500 ease-in-out will-change-transform",
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
        <nav className="flex flex-col gap-1 mt-2 px-2">
          <Link
            href="/markets"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            Markets
          </Link>
          <Link
            href="/portfolio"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            Portfolio
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white text-base hover:bg-[#232b3a] transition"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <div className="flex flex-col gap-2 mt-1 px-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setOpen(true);
                setUserData({ email: "" });
                setExpireTime(0);
                setError({});
                disconnectWallet();
              }}
            >
              Log In
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-[#eeeef0] text-[#131418]"
              onClick={() => {
                setOpen(true);
                setUserData({ email: "" });
                setExpireTime(0);
                setError({});
                disconnectWallet();
              }}
            >
              Sign Up
            </Button>
          </div>
        </nav>
      </div>

      {/* Bottom Nav */}
      <div className="h-16 flex justify-between items-center lg:hidden fixed bottom-0 w-full bg-black border-t border-[#1E1E1E] z-50 px-8 md:px-20">
        <Link
          href="/"
          className={cn(
            "w-8 h-9 flex flex-col items-center",
            activeMenu === "home" ? "text-white" : "text-gray-500"
          )}
          onClick={() => setActiveMenu("home")}
        >
          <HomeIcon className="text-2xl" />
          <span className="text-xs font-normal">Home</span>
        </Link>
        <Link
          href="#"
          className={cn(
            "w-8 h-9 flex flex-col items-center",
            activeMenu === "search" ? "text-white" : "text-gray-500"
          )}
        >
          <MagnifyingGlassIcon className="text-2xl" />
          <span className="text-xs font-normal">Search</span>
        </Link>
        <Link
          href="/profile"
          className={cn(
            "w-8 h-9 flex flex-col items-center",
            activeMenu === "profile" ? "text-white" : "text-zinc-600"
          )}
          onClick={() => setActiveMenu("profile")}
        >
          <PersonIcon className="text-2xl" />
          <span className="text-xs font-normal">Profile</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-8 h-9 flex flex-col items-center",
            activeMenu === "more" ? "text-white" : "text-gray-500"
          )}
        >
          {!isOpen ? (
            <HamburgerMenuIcon className="text-2xl" />
          ) : (
            <Cross1Icon className="text-2xl" />
          )}
          <span className="text-xs font-normal">More</span>
        </button>
      </div>
    </>
  );
}
