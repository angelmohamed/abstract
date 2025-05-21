"use client"; // Add this at the top of the file to enable client-side hooks
import Link from "next/link";
import Image from "next/image";
import { baseSepolia, polygon } from "thirdweb/chains";
import SearchBar from "@/app/components/ui/SearchBar";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import SONOTRADE from "@/public/images/logo.png";
import React, { useState, useEffect, useRef } from "react";
import { client } from "@/app/client";
import { useRouter } from "next/navigation";
import { DropdownMenu, Tooltip, Separator, Dialog } from "radix-ui";
import {
  ChevronDownIcon,
  OpenInNewWindowIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { Button } from "./components/ui/button";

export default function Header() {
  const router = useRouter();
  const account = useActiveAccount();
  const [currentPosition, setCurrentPosition] = useState("$0.00");

  // navigation handlers
  const navigateToProfilePage = () => {
    router.push("/profile");
  };
  const navigateToPortfolioPage = () => {
    router.push("/portfolio");
  };

  // 检查并创建用户资料（如果需要）
  useEffect(() => {
    async function checkAndCreateProfile() {
      if (account && account.address) {
        try {
          // 调用我们创建的 API 路由，检查并创建用户资料
          const response = await fetch(
            `/api/profile/check?wallet=${account.address}`
          );

          if (response.ok) {
            const profileData = await response.json();

            // 如果是新创建的资料，可以提示用户完善信息
            if (profileData.is_new) {
              console.log(
                "New profile created, you can complete your profile in the Profile page"
              );
              // 可以选择添加通知或直接导航到个人资料页面
              // router.push("/profilePage");
            }
          } else {
            console.error("Failed to check/create profile");
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    }

    checkAndCreateProfile();
  }, [account, router]); // 当账号变化时重新检查

  return (
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent md:h-16 h-auto pt-2 container mx-auto">
      <div className="flex w-full md:w-auto items-center justify-between p-0 md:p-4 md:ml-6 ml-0 overflow-hidden">
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
          {account && (
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
          {/* {account && (
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
              onClick={navigateToProfilePage}
            >
              <div className="text-xs text-grey">Profile</div>
            </button>
          )} */}
          <ConnectButton
            client={client}
            chain={polygon}
            connectButton={{
              label: "Connect",
              style: {
                fontSize: "14px",
                fontWeight: 500, // subtle bold
                padding: "8px 10px",
                height: "38px",
                minWidth: "80px",
              },
            }}
            detailsButton={{
              displayBalanceToken: {
                [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
              },
            }}
          />
        </div>
      </div>

      {/* Search Bar - Now visible on all screen sizes as second row on mobile/sm */}
      <div className="w-full px-4 pb-2 md:pb-0 md:pl-[2%] md:pr-[2%] mt-1 md:mt-0">
        <SearchBar placeholder="Search markets or artists" />
      </div>

      {/* Auth Buttons - For md+ screens, keep their original position */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
        {account && (
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
        {/* {account && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToProfilePage}
          >
            <div className="text-xs text-grey">Profile</div>
          </button>
        )} */}
        <ConnectButton
          client={client}
          chain={polygon}
          connectButton={{
            label: "Connect Wallet",
            style: {
              fontSize: "14px",
              fontWeight: 500, // subtle bold
              padding: "10px 16px",
              height: "40px",
              minWidth: "110px",
            },
          }}
          detailsButton={{
            displayBalanceToken: {
              [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
            },
          }}
        />
        
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="sm">
              Log In
            </Button>
          </Dialog.Trigger>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="sm" className="bg-blue-500">
              Sign Up
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="DialogTitle">
                Welcome to Sonotrade
              </Dialog.Title>
              <Button className="mt-4 w-full google_btn">
                <Image
                  src="/images/google_icon.png"
                  alt="Profile Icon"
                  width={24}
                  height={27}
                  className="rounded-full"
                />
                <span>Continue with Google</span>
              </Button>
              <div className="custom_seperator">
                <Separator.Root
                  className="SeparatorRoot"
                  style={{ margin: "15px 0" }}
                />
                or
                <Separator.Root
                  className="SeparatorRoot"
                  style={{ margin: "15px 0" }}
                />
              </div>
              <div className="custom_grpinp">
                <input
                  className="Input"
                  type="email"
                  placeholder="Enter Email"
                />
                <Button>Continue</Button>
              </div>
              <div className="flex gap-3 justify-between mt-4 sm:flex-nowrap flex-wrap">
                <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]">
                  <Image
                    src="/images/wallet_icon_01.png"
                    alt="Icon"
                    width={40}
                    height={40}
                  />
                </Button>
                <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]">
                  <Image
                    src="/images/wallet_icon_02.png"
                    alt="Icon"
                    width={40}
                    height={40}
                  />
                </Button>
                <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]">
                  <Image
                    src="/images/wallet_icon_03.png"
                    alt="Icon"
                    width={40}
                    height={40}
                  />
                </Button>
                <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]">
                  <Image
                    src="/images/wallet_icon_04.png"
                    alt="Icon"
                    width={40}
                    height={40}
                  />
                </Button>
              </div>
              <Dialog.Close asChild>
                <button className="modal_close_brn" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="profile_button" aria-label="Customise options">
              <Image
                src="/images/Ye.png"
                alt="Profile Icon"
                width={32}
                height={32}
                className="rounded-full"
              />
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <div className="custom_dropdown_portal">
              <DropdownMenu.Content
                className="DropdownMenuContent"
                sideOffset={5}
              >
                <div className="flex items-center space-x-3">
                  <Image
                    src="/images/Ye.png"
                    alt="Profile Icon"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <span className="text-sm text-gray-100">Alex</span>
                    <div className="text-sm text-gray-100 flex items-center space-x-2">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button className="IconButton bg-[#131212] px-2 py-1 rounded">
                              <span className="text-[12px]">{`${account?.address.slice(
                                0,
                                6
                              )}...${account?.address.slice(-4)}`}</span>
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <div className="custom_tooltip_content">
                              <Tooltip.Content
                                className="TooltipContent"
                                sideOffset={5}
                              >
                                Copy Address
                                <Tooltip.Arrow className="TooltipArrow" />
                              </Tooltip.Content>
                            </div>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      <Link href="#" target="_blank">
                        <OpenInNewWindowIcon className="h-[16px] w-[16px]" />
                      </Link>
                    </div>
                  </div>
                </div>
                <DropdownMenu.Separator className="DropdownMenuSeparator" />
                <DropdownMenu.Item className="DropdownMenuItem">
                  <Link href="/profile">Profile</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem">
                  <Link href="/settings">Settings</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem" disabled>
                  <Link href="/">Watchlist</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem" disabled>
                  <Link href="/">Rewards</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem" disabled>
                  <Link href="/">Learn</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem" disabled>
                  <Link href="/">Documentation</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="DropdownMenuItem" disabled>
                  <Link href="/">Terms of Use</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="DropdownMenuSeparator" />
                <DropdownMenu.Item className="DropdownMenuItem">
                  <Link href="/">Logout</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </div>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
