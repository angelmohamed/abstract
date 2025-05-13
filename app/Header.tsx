"use client";  // Add this at the top of the file to enable client-side hooks
import Link from 'next/link';
import Image from 'next/image';
import { baseSepolia, polygon } from "thirdweb/chains";
import SearchBar from '@/app/components/ui/SearchBar';
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import SONOTRADE from "@/public/images/logo.png";
import React, { useState, useEffect } from "react";
import { client } from "@/app/client";
import { useRouter } from "next/navigation";


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
          const response = await fetch(`/api/profile/check?wallet=${account.address}`);
          
          if (response.ok) {
            const profileData = await response.json();
            
            // 如果是新创建的资料，可以提示用户完善信息
            if (profileData.is_new) {
              console.log("New profile created, you can complete your profile in the Profile page");
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
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent md:h-16 h-auto md:pt-4 pt-2">
      <div className="flex w-full md:w-auto items-center justify-between p-0 md:p-4 md:ml-6 ml-0 overflow-hidden">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src={SONOTRADE} 
              alt="SONOTRADE Logo" 
              width={265}
              className="w-full pl-3 md:pl-0 sm:w-48 md:w-64"
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
              <div className="text-l" style={{ color: '#33ff4c' }}>{currentPosition}</div>
              <div className="text-xs text-grey">Portfolio</div>
            </button>
          )}
          {account && (
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
              onClick={navigateToProfilePage}
            >
              <div className="text-xs text-grey">Profile</div>
            </button>
          )}
          <ConnectButton 
            client={client}
            chain={polygon}
            connectButton={{
              label: 'Connect',
              style: {
                // 移动端使用更紧凑的设计
                fontSize: '0.75rem',
                padding: '0.5rem',
              },
            }}
            detailsButton={{
              displayBalanceToken: {
                [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
              }
            }}
          />
        </div>
      </div>

      {/* Search Bar - Now visible on all screen sizes as second row on mobile/sm */}
      <div className="w-full px-4 pb-2 md:pb-0 md:pl-[2%] md:pr-[2%] mt-1 md:mt-0">
        <SearchBar placeholder="Search markets or artists" />
      </div>

      {/* Auth Buttons - For md+ screens, keep their original position */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0 pr-10 ml-auto">
        {account && (
          <button 
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToPortfolioPage}
          >
            <div className="text-l" style={{ color: '#33ff4c' }}>{currentPosition}</div>
            <div className="text-xs text-grey">Portfolio</div>
          </button>
        )}
        {account && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToProfilePage}
          >
            <div className="text-xs text-grey">Profile</div>
          </button>
        )}
        <ConnectButton 
          client={client}
          chain={polygon}
          connectButton={{
            label: 'Connect Wallet',
            style: {
              fontSize: '14px',
              fontWeight: 550, // subtle bold
              padding: '10px 16px',
              height: '40px',
              minWidth: '110px'
            }
          }}
          detailsButton={{
            displayBalanceToken: {
              [polygon.id]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
            }
          }}
        />
      </div>
    </header>
  );
}