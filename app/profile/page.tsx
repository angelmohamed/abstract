"use client";
import Header from "@/app/Header";
import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
import { navigationItems } from "@/app/components/constants";
import { useActiveAccount } from "thirdweb/react";
import React, { useState, useEffect, useCallback } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define PolygonScan transaction type
interface PolygonTx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

export default function PortfolioPage() {
  const account = useActiveAccount();
  const wallet = account?.address;
  const [transactions, setTransactions] = useState<PolygonTx[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [currentTab, setCurrentTab] = useState("positions");
  const [amountFilter, setAmountFilter] = useState("All");
  const [profileData, setProfileData] = useState<{
    username: string;
    avatar_url: string;
    bio: string;
  } | null>(null);

  useEffect(() => {
    if (!wallet) return;
    const fetchTx = async () => {
      setLoadingTx(true);
      const res = await fetch(`/api/polygon/transactions?address=${wallet}`);
      const data = await res.json();
      setTransactions(data.result || []);
      setLoadingTx(false);
    };
    fetchTx();
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile?wallet=${wallet}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error("Error fetching profile in portfolio:", err);
      }
    };
    fetchProfile();
  }, [wallet]);

  const router = useRouter();

  // Navigate to Settings page
  const NavigateSettings = () => {
    router.push(`/settings`);
  };

  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-full backdrop-blur-md">
        <Header />
        <NavigationComponent menuItems={navigationItems} showLiveTag={true} />
      </div>
      <div className="container mx-auto py-10 px-4 container-sm">
        {/* 1. 用户信息区 */}
        {/* 1. User information area */}
        <div className="flex items-center justify-between space-x-4 mb-6 profile_top">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              {profileData?.avatar_url ? (
                <AvatarImage
                  src={profileData.avatar_url}
                  alt={profileData.username || wallet}
                />
              ) : (
                <AvatarFallback className="text-xs">
                  {profileData?.username
                    ? profileData.username.charAt(0).toUpperCase()
                    : wallet
                    ? wallet.slice(2, 8).toUpperCase()
                    : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {profileData?.username ||
                  (wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "")}
              </h2>
              <p className="text-sm text-gray-400 whitespace-normal break-all">{wallet}</p>
            </div>
          </div>
          <Button
            className="ml-auto"
            variant="outline"
            onClick={NavigateSettings}
          >
            Edit Profile
          </Button>
        </div>

        {/* 2. 关键指标卡片区 */}
        {/* 2. Key metrics card area */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#131212] p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">
              <Image
                src="/images/icon_01.png"
                alt="Icon"
                width={42}
                height={42}
              />
            </span>
            <span className="mt-2 text-lg font-semibold">$0.01</span>
            <span className="text-sm text-gray-500 mt-1">Positions value</span>
          </div>
          <div className="bg-[#131212] p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">
              <Image
                src="/images/icon_02.png"
                alt="Icon"
                width={42}
                height={42}
              />
            </span>
            <span className="mt-2 text-lg font-semibold">-$1.07</span>
            <span className="text-sm text-gray-500 mt-1">Profit / loss</span>
          </div>
          <div className="bg-[#131212] p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">
              <Image
                src="/images/icon_03.png"
                alt="Icon"
                width={42}
                height={42}
              />
            </span>
            <span className="mt-2 text-lg font-semibold">$9.25</span>
            <span className="text-sm text-gray-500 mt-1">Volume traded</span>
          </div>
          <div className="bg-[#131212] p-4 rounded-lg flex flex-col items-center">
            <span className="text-2xl">
              <Image
                src="/images/icon_04.png"
                alt="Icon"
                width={42}
                height={42}
              />
            </span>
            <span className="mt-2 text-lg font-semibold">3</span>
            <span className="text-sm text-gray-500 mt-1">Event traded</span>
          </div>
        </div>

        {/* 3. Tab 与筛选区 */}
        {/* 3. Tab and filter area */}
        <Tabs
          defaultValue="positions"
          value={currentTab}
          onValueChange={setCurrentTab}
          className="mb-4"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList className="flex space-x-4">
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="border border-gray-700 bg-black rounded p-1 text-sm"
            >
              <option>All</option>
              <option>Above 1 USDC</option>
              <option>Below 1 USDC</option>
            </select>
          </div>
          <TabsContent value="positions">
            <div className="overflow-x-auto">
              <table className="w-full text-left custom_table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Avg</th>
                    <th className="text-right">Current</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4}>
                        <p className="text-center">No positions found</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="activity">
            {loadingTx ? (
              <p>Loading transactions...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left custom_table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Market</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const time = new Date(parseInt(tx.timeStamp) * 1000);
                      const diffMinutes = Math.floor(
                        (Date.now() - time.getTime()) / 60000
                      );
                      const relTime =
                        diffMinutes < 60
                          ? `${diffMinutes}m ago`
                          : `${Math.floor(diffMinutes / 60)}h ago`;
                      const isBuy =
                        tx.to.toLowerCase() === wallet?.toLowerCase();
                      return (
                        <tr key={tx.hash} className="border-t border-gray-700">
                          <td>{isBuy ? "Buy" : "Redeem"}</td>
                          <td>{tx.to}</td>
                          <td className="text-right">
                            {(Number(tx.value) / 1e6).toFixed(4)} USDC
                          </td>
                          <td className="text-right">{relTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
