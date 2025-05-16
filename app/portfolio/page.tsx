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
import SearchBar from "../components/ui/SearchBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import Link from "next/link";
import { IconWindowMaximize } from "@tabler/icons-react";

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
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-full backdrop-blur-md">
        <Header />
        <NavigationComponent menuItems={navigationItems} showLiveTag={true} />
      </div>
      <div className="container mx-auto py-10 px-4 container-sm">
        {/* 2. Key metrics card area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
            <div className="flex items-start justify-between flex-wrap">
              <div className="flex flex-col items-left">
                <span className="text-sm text-gray-500 mt-1">PROFIT/LOSS</span>
                <span className="mt-2 text-3xl font-semibold">-$0.05</span>
                <span className="text-sm text-gray-500 mt-1">
                  <span className="text-red-500">$0.00 (0.00%)</span> Today
                </span>
              </div>
              <div className="justify-center items-center">
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
            <div className="flex space-x-4 mb-3">
              <SearchBar placeholder="Search" />
              <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
                <option>Current value</option>
                <option>Initial value</option>
                <option>Return ($)</option>
                <option>Return %</option>
              </select>
              <select className="border border-[#262626] bg-black rounded p-1 text-sm">
                <option>All</option>
                <option>Live</option>
                <option>Ended</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left custom_table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Latest</th>
                    <th>Bet</th>
                    <th>Current</th>
                    <th>To Win</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5}>
                      <p className="text-center">No positions found</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="openorders">
            <div className="flex space-x-4 mb-3">
              <SearchBar placeholder="Search" />
              <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
                <option>Market</option>
                <option>Filled Quantity</option>
                <option>Total Quantity</option>
                <option>Order Date</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left custom_table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Side</th>
                    <th>Outcome</th>
                    <th>Price</th>
                    <th>Filled</th>
                    <th>Total</th>
                    <th>Expiration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7}>
                      <p className="text-center">No open orders found.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="flex space-x-4 mb-3">
              <SearchBar placeholder="Search" />
              <DatePicker
                placeholderText="Select date"
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                className="custom_datepicker"
              />
              <select className="border border-[#262626] bg-black rounded p-1 text-sm">
                <option>All</option>
                <option>All Trades</option>
                <option>Buy</option>
                <option>Sell</option>
                <option>Reward</option>
              </select>
              <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
                <option>Newest</option>
                <option>Oldest</option>
                <option>Value</option>
                <option>Shares</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left custom_table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Market</th>
                    <th>Outcome</th>
                    <th>Price</th>
                    <th>Shares</th>
                    <th>Values</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sell</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          <Image
                            src="/images/album.png"
                            alt="Icon"
                            width={42}
                            height={42}
                          />
                        </span>
                        <Link className="text-sm font-normal" href="/">
                          Stars vs Jets
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Badge className="z-10 text-xs text-[#27ae60] bg-[#e9f7ef] font-normal">
                        Stars
                      </Badge>
                    </td>
                    <td>$57</td>
                    <td>2</td>
                    <td>$0.98</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-normal">1 day ago</span>
                        <a href="#" target="_blank">
                          <IconWindowMaximize className="h-[32px] w-[32px]" />
                        </a>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Buy</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">
                          <Image
                            src="/images/album.png"
                            alt="Icon"
                            width={42}
                            height={42}
                          />
                        </span>
                        <Link className="text-sm font-normal" href="/">
                          Stars vs Jets
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Badge className="z-10 text-xs text-[#e64800] bg-[#fdeeee] font-normal">
                        Stars
                      </Badge>
                    </td>
                    <td>$57</td>
                    <td>2</td>
                    <td>$0.98</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-normal">5 days ago</span>
                        <a href="#" target="_blank">
                          <IconWindowMaximize className="h-[32px] w-[32px]" />
                        </a>
                      </div>
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
