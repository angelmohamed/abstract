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
import { Badge } from "@/app/components/ui/badge";
import ChartIntervals from "@/app/components/customComponents/ChartIntervals";

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

  const [interval, setInterval] = useState("all");

  return (
    <div className="overflow-hidden text-white bg-black min-h-screen">
      <div className="sticky top-0 z-50 w-full backdrop-blur-md">
        <Header />
        <NavigationComponent menuItems={navigationItems} showLiveTag={true} />
      </div>
      <div className="container mx-auto py-10 px-4">
        {/* 2. Key metrics card area */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#131212] p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-left">
                <span className="text-sm text-gray-500 mt-1">PORTFOLIO</span>
                <span className="mt-2 text-3xl font-semibold">$10.97</span>
                <span className="text-sm text-gray-500 mt-1">
                  <span className="text-green-500">$0.00 (0.00%)</span> Today
                </span>
              </div>
              <Badge className="z-10 text-sm text-white bg-[#00c735] font-normal">
                $10.96
              </Badge>
            </div>
            <div
              className="pb-0 mt-3"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                className="text-[12px]"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "48%",
                }}
              >
                <Button className="w-full mb-1 bg-[#152632] text-[#7dfdfe] hover:bg-[#7dfdfe] hover:text-[#000000] transition-colors duration-300 rounded-full">
                  Deposit
                </Button>
              </div>

              <div
                className="text-[12px]"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "48%",
                }}
              >
                <Button className="w-full mb-1 bg-[#321b29] text-[#ec4899] hover:bg-[#ec4899] hover:text-[#000000] transition-colors duration-300 rounded-full">
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-[#131212] p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-left">
                <span className="text-sm text-gray-500 mt-1">PROFIT/LOSS</span>
                <span className="mt-2 text-3xl font-semibold">-$0.05</span>
                <span className="text-sm text-gray-500 mt-1">
                  <span className="text-red-500">$0.00 (0.00%)</span> Today
                </span>
              </div>
              <div className="pl-12 pr-0 sm:pl-0 sm:pr-0 justify-center items-center">
                <ChartIntervals interval={interval} setInterval={setInterval} />
              </div>
            </div>
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
              <TabsTrigger value="openorders">Open Orders</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>            
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
          <TabsContent value="openorders">
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
          <TabsContent value="history">
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
        </Tabs>
      </div>
    </div>
  );
}
