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
import { Dialog, Accordion, Checkbox } from "radix-ui";
import {
  Cross2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  InfoCircledIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Input } from "../components/ui/input";

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
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <Button className="w-full mb-1 bg-[#152632] text-[#7dfdfe] hover:bg-[#7dfdfe] hover:text-[#000000] transition-colors duration-300 rounded-full">
                      Deposit
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="DialogOverlay" />
                    <Dialog.Content className="DialogContent">
                      <Dialog.Title className="DialogTitle">
                        Deposit
                      </Dialog.Title>
                      <p className="text-center text-[12px] text-gray-400 mb-0">
                        Available Balance: $10.96
                      </p>

                      {/* Deposit Form Step 1 */}
                      <div className="deposit_step deposit_step1">
                        <Button className="mt-4 w-full google_btn flex-col items-start:[!important]">
                          <p className="text-[12px] text-gray-400 mb-0">
                            Deposit from
                          </p>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/images/wallet_icon_01.png"
                              alt="Profile Icon"
                              width={16}
                              height={16}
                              className="rounded-full"
                            />
                            <span className="text-[14px] text-gray-200">
                              Wallet (0x1DED...d96b)
                            </span>
                            <span className="text-[13px] text-gray-400">
                              $ 10.20
                            </span>
                          </div>
                        </Button>

                        <div className="wallet_coin_list">
                          <div className="flex items-center justify-between my-3 border border-[#3d3d3d] px-3 py-1 rounded">
                            <div className="flex items-center gap-2">
                              <Image
                                src="/images/usdt.svg"
                                alt="Profile Icon"
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <div className="flex flex-col">
                                <span className="text-[14px]">USDT</span>
                                <span className="text-[12px] text-gray-400">
                                  9.86121 USDT
                                </span>
                              </div>
                            </div>
                            <span className="text-[14px]">$9.88</span>
                          </div>
                        </div>
                        <Button className="mt-4 w-full">Continue</Button>
                      </div>

                      {/* Deposit Form Step 2 */}
                      <div className="deposit_step deposit_step2">
                        <Button className="rounded-full p-0 h-8 w-8 absolute -top-12">
                          <ChevronLeftIcon />
                        </Button>
                        <input
                          className="wallet_inp"
                          type="number"
                          placeholder="$ 0.00"
                        />
                        <div className="flex gap-3 justify-between mt-4 sm:flex-nowrap flex-wrap">
                          <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]">
                            25%
                          </Button>
                          <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]">
                            50%
                          </Button>
                          <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]">
                            75%
                          </Button>
                          <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]">
                            Max
                          </Button>
                        </div>
                        <p className="text-[12px] text-gray-400 text-center mt-8">
                          $1.00 minimum order
                        </p>
                        <div
                          className="flex gap-3 items-center justify-between sm:flex-nowrap flex-wrap py-3 px-4 border border-[#3d3d3d] rounded-full sm:w-[60%] w-[100%] m-auto mt-3
                        "
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src="/images/usdt.svg"
                              alt="Icon"
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <div className="flex flex-col">
                              <span className="text-[12px] text-gray-400">
                                You Sent
                              </span>
                              <span className="text-[14px]">USDT</span>
                            </div>
                          </div>
                          <Image
                            src="/images/arrow_icon.png"
                            alt="Icon"
                            width={16}
                            height={16}
                          />
                          <div className="flex items-center gap-2">
                            <Image
                              src="/images/usdc.svg"
                              alt="Icon"
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <div className="flex flex-col">
                              <span className="text-[12px] text-gray-400">
                                You Receive
                              </span>
                              <span className="text-[14px]">USDC</span>
                            </div>
                          </div>
                        </div>
                        <Button className="mt-4 w-full">Continue</Button>
                      </div>

                      {/* Deposit Form Step 3 */}
                      <div className="deposit_step deposit_step3">
                        <Button className="rounded-full p-0 h-8 w-8 absolute -top-12">
                          <ChevronLeftIcon />
                        </Button>
                        <div className="wallet_countdown_panel">
                          <CountdownCircleTimer
                            isPlaying
                            duration={60}
                            colors={[
                              "#3b82f6",
                              "#F7B801",
                              "#A30000",
                              "#A30000",
                            ]}
                            colorsTime={[30, 15, 10, 0]}
                            size={30}
                            strokeWidth={1.5}
                            trailStrokeWidth={1.5}
                          >
                            {({ remainingTime }) => (
                              <span className="text-[12px]">
                                {remainingTime}
                              </span>
                            )}
                          </CountdownCircleTimer>
                        </div>
                        <p className="text-4xl text-[#efefef] text-center font-semibold pt-5 pb-2">
                          $1.00
                        </p>
                        <div className="flex gap-2 items-center justify-between py-3 border-b border-[#302f2f] mt-4">
                          <span className="text-[14px] text-gray-400">
                            Source
                          </span>
                          <div className="flex gap-2 items-center">
                            <Image
                              src="/images/wallet_icon_01.png"
                              alt="Icon"
                              width={18}
                              height={18}
                            />
                            <span className="text-[14px] text-gray-200">
                              Wallet (…d96b)
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center justify-between py-3 border-b border-[#302f2f]">
                          <span className="text-[14px] text-gray-400">
                            Destination
                          </span>
                          <span className="text-[14px] text-gray-200">
                            Sonotrade Wallet
                          </span>
                        </div>
                        <div className="flex gap-2 items-center justify-between py-3 border-b border-[#302f2f]">
                          <span className="text-[14px] text-gray-400">
                            Estimated time
                          </span>
                          <span className="text-[14px] text-gray-200">
                            Less than 1 min
                          </span>
                        </div>
                        <div className="flex gap-2 items-center justify-between py-3 border-b border-[#302f2f]">
                          <span className="text-[14px] text-gray-400">
                            You send
                          </span>
                          <div className="flex gap-2 items-center">
                            <Image
                              src="/images/usdt.svg"
                              alt="Icon"
                              width={18}
                              height={18}
                            />
                            <span className="text-[14px] text-gray-200">
                              1.02021 USDT
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center justify-between py-3 border-b border-[#302f2f]">
                          <span className="text-[14px] text-gray-400">
                            You receive
                          </span>
                          <div className="flex gap-2 items-center">
                            <Image
                              src="/images/usdc.svg"
                              alt="Icon"
                              width={18}
                              height={18}
                            />
                            <span className="text-[14px] text-gray-200">
                              0.99750 USDC
                            </span>
                          </div>
                        </div>

                        <Accordion.Root type="multiple">
                          <Accordion.Item value="item-1">
                            <Accordion.Header>
                              <Accordion.Trigger className="flex gap-2 items-center justify-between py-3 border-b border-[#302f2f] w-full">
                                <span className="text-[14px] text-gray-400">
                                  Transaction breakdown
                                </span>
                                <div className="flex gap-2 items-center">
                                  <Image
                                    src="/images/gas_icon.png"
                                    alt="Icon"
                                    width={18}
                                    height={18}
                                  />
                                  <span className="text-[14px] text-gray-200">
                                    $0.01
                                  </span>
                                  <ChevronDownIcon
                                    className="AccordionChevron"
                                    aria-hidden
                                  />
                                </div>
                              </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content>
                              <div className="flex gap-2 items-center justify-between py-1">
                                <span className="text-[13px] text-gray-400">
                                  Your gas costs
                                </span>
                                <span className="text-[13px] text-gray-200">
                                  $0.01
                                </span>
                              </div>

                              <div className="flex gap-2 items-center justify-between py-1">
                                <span className="text-[13px] text-gray-400">
                                  Market maker gas costs
                                </span>
                                <span className="text-[13px] text-gray-200">
                                  $0.01
                                </span>
                              </div>

                              <div className="flex gap-2 items-center justify-between py-1 border-b border-[#302f2f]">
                                <span className="text-[13px] text-gray-400">
                                  LP cost
                                </span>
                                <span className="text-[13px] text-gray-200">
                                  $0.01
                                </span>
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                        </Accordion.Root>
                        <Button className="mt-4 w-full">Confirm Order</Button>
                      </div>

                      <Dialog.Close asChild>
                        <button className="modal_close_brn" aria-label="Close">
                          <Cross2Icon />
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
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
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <Button className="w-full mb-1 bg-[#321b29] text-[#ec4899] hover:bg-[#ec4899] hover:text-[#000000] transition-colors duration-300 rounded-full">
                      Withdraw
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="DialogOverlay" />
                    <Dialog.Content className="DialogContent">
                      <Dialog.Title className="DialogTitle">
                        Withdraw
                      </Dialog.Title>
                      <div className="flex gap-2 items-center bg-[#eff4fe] p-3 rounded-lg mt-4">
                        <InfoCircledIcon className="text-[#1652f0]" />
                        <span className="text-[14px] text-gray-700">
                          Only send to a USDC address on the Polygon network.
                        </span>
                      </div>
                      <form className="mt-4">
                        <fieldset className="Fieldset mb-4">
                          <div className="flex gap-2 items-center justify-between mb-1">
                            <label className="Label" htmlFor="Address">
                              Address
                            </label>
                            <span className="text-[14px] text-gray-400 cursor-pointer underline underline-offset-4">
                              Use connected
                            </span>
                          </div>
                          <Input
                            type="text"
                            placeholder="0x..."
                            className="Input h-12"
                            id="Address"
                          />
                        </fieldset>

                        <fieldset className="Fieldset mt-4">
                          <div className="flex gap-2 items-center justify-between mb-1">
                            <label className="Label" htmlFor="Amount">
                              Amount{" "}
                              <span className="text-[14px] text-gray-400">
                                ($0.01 min)
                              </span>
                            </label>
                            <div className="flex gap-2">
                              <span className="text-[14px] text-gray-400 cursor-pointer">
                                $8.96 available
                              </span>
                              <span className="text-[14px] text-gray-400 cursor-pointer underline underline-offset-4">
                                Max
                              </span>
                            </div>
                          </div>
                          <Input
                            type="text"
                            placeholder="$0.00"
                            className="Input h-12"
                            id="Amount"
                          />
                        </fieldset>

                        <div className="flex items-center space-x-2 mt-4">
                          <Checkbox.Root
                            className="CheckboxRoot"
                            defaultChecked
                            id="c1"
                          >
                            <Checkbox.Indicator className="CheckboxIndicator">
                              <CheckIcon className="h-[20px] w-[20px]" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <label className="Label" htmlFor="c1">
                            Send USDC.e (don’t swap to native USDC)
                          </label>
                        </div>

                        <Button className="mt-4 w-full">Withdraw</Button>
                      </form>
                      <Dialog.Close asChild>
                        <button className="modal_close_brn" aria-label="Close">
                          <Cross2Icon />
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
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
                        <div className="flex flex-col gap-1">
                          <Link className="text-sm font-normal" href="/">
                            Stars vs Jets
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge className="z-10 text-xs text-[#27ae60] bg-[#e9f7ef] font-normal">
                              Stars
                            </Badge>
                            <span className="text-xs font-normal">
                              4 Shares
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>51¢</td>
                    <td>$2.00</td>
                    <td>
                      $1.93 <span className="text-red-500">(-3.22%)</span>
                    </td>
                    <td>$3.83</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Button className="bg-[#ec4899] text-[#fff] hover:text-[#000]">
                          Sell
                        </Button>
                        <Button>Share</Button>
                      </div>
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
