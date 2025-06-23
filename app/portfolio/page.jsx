"use client";
import Header from "@/app/Header";
// import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
// import { navigationItems } from "@/constants";
import React, { useState, useEffect, useCallback } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import Web3 from "web3";
import config from "../../config/config";
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
import { Dialog, Accordion, Checkbox, Separator } from "radix-ui";
import { shortText, numberFloatOnly } from "../helper/custommath";
import { toastAlert } from "../../lib/toast"
import isEmpty from "is-empty";
import {
  Cross2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  InfoCircledIcon,
  CheckIcon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Input } from "../components/ui/input";
import { useSelector } from "@/store";
import { useDispatch } from "react-redux";
import { setWallet } from "@/store/slices/wallet/dataSlice";
import {
  getCoinAmt,
  depsoitToken,
  depsoitCoin,
  approveToken,
  getGasCostAmt,
} from "./multicall";
import { walletClientToSigner } from "../helper/ethersconnect";
import { formatNumber } from "../helper/custommath";
import tokenABI from "../../components/ABI/TOKENABI.json";
import { addressCheck } from "@/services/wallet";
import { Connection, PublicKey } from '@solana/web3.js';
import { reset } from "@/store/slices/auth/userSlice"
import { signOut } from "@/store/slices/auth/sessionSlice";
import OpenOrders from "./OpenOrders"
import Positions from "./Positions"
import History from "./History"
import { Footer } from "../components/customComponents/Footer";
import { setWalletConnect } from "@/store/slices/walletconnect/walletSlice";
import { PnLFormatted } from "@/utils/helpers";

let initialValue = {
  currency: "",
  amount: "",
  walletAddress: "",
};

export default function PortfolioPage() {

  const { isConnected,address } = useSelector((state) => state?.walletconnect?.walletconnect);
  const walletData = useSelector(state => state?.wallet?.data);
  const data = useSelector(state => state?.auth?.user);

  const [open, setOpen] = useState(false);
  const [check, setCheck] = useState(false);
  const [step, setStep] = useState("");
  const wallet = address;
  const [balance, setBalance] = useState(0);
  const [tokenbalance, setTokenBalance] = useState(0);
  const [currentTab, setCurrentTab] = useState("positions");
  const [depositData, setDepositData] = useState(initialValue);
  const [depsoitAmt, setDepositAmt] = useState(0);
  const [loader, setloader] = useState(false);
  const [txopen, setTxOpen] = useState(false);
  const [showallowance, setshowallowance] = useState(false);
  const [transactionHash, settransactionHash] = useState("");
  const [connval, setconnval] = useState(null);
  const [tokenValue, setTokenValue] = useState({
    minDeposit: 0,
    tokenAmt: 0,
    allowance: 0,
    usdConvt: 0,
  });
  const [profitAmount, setProfitAmount] = useState(0);
  const [interval, setInterval] = useState("max");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const router = useRouter();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState({
    username: "",
    avatar_url: "",
    bio: "",
  });
  const [gasAmt, setGasAmt] = useState({ gasCost: 0, marketGasCost: 0 });

  var { currency, amount, walletAddress } = depositData;
  var { minDeposit, tokenAmt, allowance, usdConvt } = tokenValue;

  useEffect(() => {
    setProfitAmount(walletData?.position);
  }, [walletData ,interval]);

  // useEffect(() => {
  //   if (!wallet) return;
  //   const fetchTx = async () => {
  //     setLoadingTx(true);
  //     const res = await fetch(`/api/polygon/transactions?address=${wallet}`);
  //     const data = await res.json();
  //     setTransactions(data.result || []);
  //     setLoadingTx(false);
  //   };
  //   fetchTx();
  // }, [wallet]);

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

  const balanceData = async () => {
    try {
      const web3 = new Web3(config.rpcUrl);
      if(address){
      const balanceWei = await web3.eth.getBalance(address);
      const balancePOL = web3.utils.fromWei(balanceWei, "ether");
      const formattedBalance = parseFloat(balancePOL).toFixed(6);
      setBalance(formattedBalance);
      const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
      const decimals = await usdcContract.methods.decimals().call();
      const rawBalance = await usdcContract.methods.balanceOf(address).call();
      const formattedBalance1 = parseFloat(rawBalance / 10 ** decimals).toFixed(
        4
      );
      setTokenBalance(formattedBalance1);
      }
    } catch (err) {
      console.error("Error fetching POL balance:", err);
    }
  };

  async function disconnectWallet() {
    if (window.solana && window.solana.isPhantom) {
      window.solana.disconnect();
      dispatch(
        setWalletConnect({
          isConnected:false,
          address: "",
          network: "",
          type: "",
          rpc: "",
          balance: 0
        }));
    }
  }

  // async function handleConnect(connector) {
  //   try {
  //     disconnectWallet()
  //     var network = config.chainId;

  //     let check = isMobile();
  //     var isType = connector && connector.id ? connector.id : "";

  //     if (check && !window.ethereum && isType == "MetaMask") {
  //       connectMetamaskMobile();
  //       return;
  //     } else {
  //       var web3 = null;
  //       if (isType == "injected") {
  //         web3 = new Web3(window.BinanceChain);
  //       } else if (isType !== "walletConnect") {
  //         web3 = new Web3(window.ethereum);
  //       } else {
  //         var rpcUrl = config.rpcUrl;
  //         web3 = new Web3(rpcUrl);
  //       }
  //       var currnetwork = await web3.eth.net.getId();

  //       if (
  //         parseInt(currnetwork) !== parseInt(network) &&
  //         isType !== "walletConnect"
  //       ) {
  //         await window.ethereum.request({
  //           method: "wallet_switchEthereumChain",
  //           params: [{ chainId: Web3.utils.toHex(network) }],
  //         });
  //         currnetwork = network;
  //       }

  //       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  //       const connectedAddress = accounts?.[0];

  //       const { result } = await addressCheck({ address : connectedAddress });
    
  //       if((isEmpty(data?.walletAddress) && result === true)){
  //         toastAlert(
  //           "error",
  //           `This address is already exists. Please connect another new address.`,"wallet"
  //         )
  //         setOpen(false);
  //         disconnectWallet()
  //         return;
  //       }else if (!isEmpty(data?.walletAddress) && connectedAddress?.toLowerCase() !== data?.walletAddress?.toLowerCase()) {
  //         toastAlert("error", `Please connect your wallet address ${data?.walletAddress}`, "logout");
  //         setOpen(false);
  //         disconnectWallet()
  //         return;
  //       }
    
  //       await connectWallet(connector);
  //       setOpen(false);
  //       getAddress();
  //     }
  //   } catch (err) {
  //     console.log(err, "errerr");
  //     var error = err && err.message ? err.message.toString() : err.toString();
  //     var pos = error.search("Provider not set or invalid");
  //     var pos1 = error.search("User rejected");
  //     if (pos >= 0) {
  //       toastAlert("error", "Please login into metamask","wallet");
  //     } else if (pos1 >= 0) {
  //       toastAlert("error", "Confirmation is rejected","wallet");
  //     } else {
  //       toastAlert("error", "Please try again later","wallet");
  //     }
  //   }
  // }

  async function ConnectPhantomWallet() {
    if (window.solana && window.solana.isPhantom) {
      try {
        if (window.solana.isConnected) {
          await window.solana.disconnect();
        }
        const response = await window.solana.connect({ onlyIfTrusted: false });

        const connection = new Connection(config?.rpcUrl);

        const publicKey = new PublicKey(response.publicKey.toString());
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / 1e9;
        console.log(balanceSOL, balanceLamports, 'balanceSOLbalanceSOL')
        const connectedAddress = response.publicKey.toString()

        const { result } = await addressCheck({ address : connectedAddress });

        if((isEmpty(data?.walletAddress) && result === true)){
          toastAlert(
            "error",
            `This address is already exists. Please connect another new address.`,"wallet"
          )
          setOpen(false);
          disconnectWallet()
          return;
        }else if (!isEmpty(data?.walletAddress) && connectedAddress?.toLowerCase() !== data?.walletAddress?.toLowerCase()) {
          toastAlert("error", `Please connect your wallet address ${data?.walletAddress}`, "logout");
          setOpen(false);
          disconnectWallet()
          return;
        }
    
        dispatch(
          setWalletConnect({
            isConnected: true,
            address: response.publicKey.toString(),
            network: config.network,
            type: config.networkType,
            rpc: config?.rpcUrl,
            balance: balanceSOL
          })
        );
        setOpen(false);
        getAddress();
        toastAlert("success", "Wallet Connected successfully!!", "wallet");
      } catch (err) {
        console.log(err, "errerr");
        if (err?.code === 4001) {
          toastAlert("error", "Connection request was rejected", "wallet");
        }
        dispatch(
          setWalletConnect({
            isConnected:false,
            address: "",
            network: "",
            type: "",
            rpc: "",
            balance: 0
          }));
        toastAlert("error", "Failed to connect wallet", "wallet");
      }
    } else {
      toastAlert("error", "Phantom wallet extension is not installed", "error");
    }
  }


  const getCoinValue = async () => {
    try {
      const web3 = new Web3(config.rpcUrl);
      const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
      const decimals = await usdcContract.methods.decimals().call();
      let amt = depsoitAmt * 10 ** decimals;
      console.log(amt, "depsoitAmtdepsoitAmt");
      let { minDeposit, tokenAmt, allowance, usdConvt } = await getCoinAmt(
        address,
        amt,
        connval,
      );
      console.log(usdConvt,"usdConvtusdConvt")
      setTokenValue({ minDeposit, tokenAmt, allowance, usdConvt });

      //gasCostValues
      var gasPrice = await web3.eth.getGasPrice();
      var marketGasCost = (gasPrice / 1e9) * usdConvt;
      let estimateGas = 110171;
      console.log(
        marketGasCost,
        "***********************21",
        usdConvt,
        gasPrice
      );
      var gasCost = ((gasPrice * estimateGas) / 1e18) * usdConvt;
      setGasAmt({ marketGasCost: gasPrice / 1e9, gasCost });
    } catch (err) {
      console.log(err, "errr");
    }
  };

  const getAddress = async (address) => {
    try {
      const { result } = await addressCheck({ address });
      if((isEmpty(data?.walletAddress) && result === true)){
        toastAlert(
          "error",
          `This address is already exists. Please connect another address.`,"wallet"
        );
        disconnect()
      }else if (
        (!isEmpty(data?.walletAddress) && result === true) ||
        !isEmpty(data?.walletAddress) && data?.walletAddress.toString() != address?.toString() && isConnected
      ) {
        toastAlert(
          "error",
          `Please connect your wallet address ${data?.walletAddress}`,"wallet"
        );
        disconnect()
      } else if (
        (!isEmpty(data?.walletAddress) && result === false) ||
        (isEmpty(data?.walletAddress) && result === false)
      ) {
        return;
      }
    } catch (error) {
      console.error("Error in getAddress:", error);
    }
  };

  // useEffect(() => {
  //   if (isConnected == true) {
  //     getAddress(address);
  //   }
  // }, [isConnected]);

  // useEffect(() => {
  //   getCoinValue()
  // }, [depsoitAmt])

  useEffect(() => {
    balanceData();
  }, [address]);

  var step2Click = () => {
    if (!isEmpty(currency)) {
      setStep("2");
      setDepositAmt()
      getCoinValue();
    } else {
      toastAlert("error", "Please select a currency","wallet");
    }
  };

  var step3Click = () => {
    try {
      var depositBalance = currency == "USDT" ? tokenbalance : balance;
      if (depositBalance > 0) {
        if (isEmpty(depsoitAmt) || depsoitAmt < parseFloat(minDeposit)) {
          toastAlert(
            "error",
            "Enter the amount must be greater than minimum deposit value","deposit"
          );
        } else if (currency == "POL" && depsoitAmt < 0.001) {
          toastAlert(
            "error",
            `Enter the amount must be greater than minimum deposit value`,"deposit"
          );
        } else if (depsoitAmt > depositBalance) {
          toastAlert("error", "Insufficient Balance","deposit");
        } else if (depsoitAmt > 0) {
          setStep("3");
          getCoinValue();
        }
      } else if (depositBalance <= 0) {
        toastAlert("error", "Insufficient Balance","deposit");
      }
    } catch (err) {
      console.log(err, "ererrrr");
    }
  };

  const balanceChange = (value) => {
    if (currency == "USDT") {
      setDepositAmt(tokenbalance * (value / 100));
    } else {
      setDepositAmt(balance * (value / 100));
    }
  };

  async function disconnect() {
    disconnectWallet();
  }

  async function buy() {
    try {
      setloader(true);

      if (currency == "USDT") {
        var { status, txId, message } = await depsoitToken(
          address,
          depsoitAmt,
          connval,
          dispatch
        );
        settransactionHash(txId);
        setloader(true);
        if (status) {
          toastAlert("success", "Your transaction is successfully completed","deposit");
          setDepositAmt(0);
          setStep("");
          setTxOpen(true);
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
          // await getUser();
        } else {
          toastAlert("error", message,"deposit");
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
        }
        setloader(false);
      } else if (currency == "POL") {
        var { status, txId, message } = await depsoitCoin(
          address,
          depsoitAmt,
          connval,
          dispatch
        );
        settransactionHash(txId);
        setloader(true);
        if (status) {
          toastAlert("success", "Your transaction is successfully completed","deposit");
          setDepositAmt(0);
          setStep("");
          setTxOpen(true);
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
          // await getUser();
        } else {
          toastAlert("error", message,"deposit");
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
        }
        setloader(false);
      }
    } catch (err) {
      setloader(false);
    }
  }

  const handlechange = async (e) => {
    let value = e.target.value;
    setDepositAmt(e.target.value);
    let isNum = numberFloatOnly(value);
    if (isNum) {
      setshowallowance(false);
      if (value > allowance && currency == "USDT") {
        setshowallowance(true);
      }
    }
  };

  async function approve() {
    setloader(true);
    try {
      var { approvalAmt, isAllowed, error } = await approveToken(
        address,
        connval
      );
      if (isAllowed) {
        if (depsoitAmt > approvalAmt) {
          toastAlert("error", "Insufficient approval amount","deposit");
        } else {
          toastAlert("success", "Successfully approved","deposit");
          setshowallowance(false);
        }
      } else {
        toastAlert("error", error,"deposit");
      }
      setloader(false);
    } catch (err) {
      setloader(false);
    }
  }

  const isLogin = () => {
    if (localStorage.getItem("sonoTradeToken")) {
      return true;
    }
    return false;
  };

  const iniDepsotClick = () => {
    if (isConnected == true) {
      setStep("1");
      setDepositAmt(0);
      getCoinValue();
      balanceData()
      setTxOpen(false);
    }else if(!isEmpty(data?.walletAddress) && 
    data?.walletAddress.toString() != address?.toString() && isConnected){
      toastAlert(
        "error",
        `Please connect your wallet address ${data?.walletAddress}`,"wallet"
      );
    } else {
      toastAlert("error", "Connect Your Wallet","deposit");
    }
  };
  // useEffect(() => {
  //   if (isLogin() == false) {
  //     window.location.href = "/";
  //   }
  //   // getUser();
  // }, []);
  // console.log(data,walletData, tokenAmt, usdConvt,isConnected,"datadatadata");
  return (
    <>
      <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
        <div className="sticky top-0 z-50 w-full backdrop-blur-md">
          <Header />
          {/* <NavigationComponent menuItems={navigationItems} showLiveTag={true} /> */}
        </div>
        <div className="container mx-auto py-10 px-4 container-sm">
            <div className="flex justify-end mb-4">
              {isConnected ? (
                <>
                  <Button className="mr-2">{shortText(address)}</Button>
                  <Button onClick={() => disconnect()}>Disconnect</Button>
                </>
              ) : (
                <Button onClick={() => setOpen(true)}>Connect Wallet</Button>
              )}
            </div>
            {/* <p>Your Wallet Address : {shortValue(data?.walletAddress)}</p> */}
          <br></br>
          {/* 2. Key metrics card area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#131212] p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex flex-col items-left">
                  <span className="text-sm text-gray-500 mt-1">PORTFOLIO</span>
                  <span className="mt-2 text-3xl font-semibold">
                    {walletData?.balance
                      ? PnLFormatted(formatNumber(walletData?.balance - walletData?.locked + walletData?.position, 2))
                      : 0}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    <span className="text-green-500">$0.00 (0.00%)</span> Today
                  </span>
                </div>
                <Badge className="z-10 text-sm text-white bg-[#00c735] font-normal">
                  {walletData?.balance ? PnLFormatted(formatNumber(walletData?.balance - walletData?.locked + walletData?.position, 2)) : 0}
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
                      <Button
                        onClick={() => iniDepsotClick()}
                        className="w-full mb-1 bg-[#1f3e2c] text-[#27ae60] hover:bg-[#27ae60] hover:text-[#000000] transition-colors duration-300 rounded-full"
                      >
                        Deposit
                      </Button>
                    </Dialog.Trigger>
                    {isConnected == true && txopen == false && (
                      <Dialog.Portal>
                        <Dialog.Overlay className="DialogOverlay" />
                        <Dialog.Content className="DialogContent">
                          {(step == "1" || step == "2" || step == "3") && (
                            <Dialog.Title className="DialogTitle">
                              Deposit
                            </Dialog.Title>
                          )}
                          {(step == "1" || step == "2" || step == "3") && (
                            <p className="text-center text-[12px] text-gray-400 mb-0">
                              Available Balance: ${" "}
                              {currency === "USDT"
                                ? `${tokenbalance} ${currency}`
                                : `${formatNumber(balance * usdConvt,4)} ${currency}`}
                            </p>
                          )}
                          {step == "1" && (
                            <div className="deposit_step deposit_step1">
                              {/* Wallet Info Button */}
                              <Button className="mt-4 w-full google_btn flex-col items-start">
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
                                    Wallet {shortText(address)}
                                  </span>
                                  <span className="text-[13px] text-gray-400">
                                    {/* $10.20 */}
                                    {balance} POL
                                  </span>
                                </div>
                              </Button>

                              <div className="wallet_coin_list">
                                <div
                                  className={`flex items-center justify-between my-3 border px-3 py-1 rounded cursor-pointer transition ${
                                    depositData.currency === "USDT"
                                      ? "border-[#4f99ff] bg-[#1a1a1a]" // Highlight when selected
                                      : "border-[#3d3d3d] hover:bg-[#1e1e1e]"
                                  }`}
                                  onClick={() =>
                                    setDepositData((prev) => ({
                                      ...prev,
                                      currency: "USDT",
                                    }))
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/images/usdt.svg"
                                      alt="USDT Icon"
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-[14px]">USDT</span>
                                      <span className="text-[12px] text-gray-400">
                                        {tokenbalance} USDT
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[14px]">
                                    $ {tokenbalance}
                                  </span>
                                </div>
                              </div>

                              <div className="wallet_coin_list">
                                <div
                                  className={`flex items-center justify-between my-3 border px-3 py-1 rounded cursor-pointer transition ${
                                    depositData.currency === "POL"
                                      ? "border-[#4f99ff] bg-[#1a1a1a]" // Highlight when selected
                                      : "border-[#3d3d3d] hover:bg-[#1e1e1e]"
                                  }`}
                                  onClick={() =>
                                    setDepositData((prev) => ({
                                      ...prev,
                                      currency: "POL",
                                    }))
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src="/images/polygon.svg"
                                      alt="POL Icon"
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-[14px]">POL</span>
                                      <span className="text-[12px] text-gray-400">
                                        {balance} POL
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[14px]">
                                    {/* $9.88 */}${" "}
                                    {formatNumber(balance * usdConvt, 4)}
                                  </span>
                                </div>
                              </div>

                              <Button
                                className="mt-4 w-full"
                                onClick={() => step2Click()}
                              >
                                Continue
                              </Button>
                            </div>
                          )}
                          {step == "2" && (
                            <div className="deposit_step deposit_step1">
                              {/* Deposit Form Step 2 */}
                              <Button
                                className="rounded-full p-0 h-8 w-8 absolute -top-12"
                                onClick={() => setStep("1")}
                              >
                                <ChevronLeftIcon />
                              </Button>
                              <input
                                className="wallet_inp"
                                type="number"
                                onChange={handlechange}
                                value={depsoitAmt}
                                placeholder="0"
                              />
                              <div className="flex gap-3 justify-between mt-4 sm:flex-nowrap flex-wrap">
                                <Button
                                  className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                  onClick={() => balanceChange(25)}
                                >
                                  25%
                                </Button>
                                <Button
                                  className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                  onClick={() => balanceChange(50)}
                                >
                                  50%
                                </Button>
                                <Button
                                  className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                  onClick={() => balanceChange(75)}
                                >
                                  75%
                                </Button>
                                <Button
                                  className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                  onClick={() => balanceChange(100)}
                                >
                                  Max
                                </Button>
                              </div>
                              <p className="text-[12px] text-gray-400 text-center mt-8">
                                {currency === "POL"
                                  ? `${0.001} minimum deposit`
                                  : `${minDeposit} ${currency} minimum deposit`}
                              </p>
                              <div
                                className="flex gap-3 items-center justify-between sm:flex-nowrap flex-wrap py-3 px-4 border border-[#3d3d3d] rounded-full sm:w-[60%] w-[100%] m-auto mt-3
                          "
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={
                                      currency == "USDT"
                                        ? "/images/usdt.svg"
                                        : "/images/polygon.svg"
                                    }
                                    alt="Icon"
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-[12px] text-gray-400">
                                      You Sent
                                    </span>
                                    <span className="text-[14px]">
                                      {currency}
                                    </span>
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
                              <Button
                                className="mt-4 w-full"
                                onClick={() => step3Click()}
                              >
                                Continue
                              </Button>
                            </div>
                          )}
                          {step == "3" && (
                            <div className="deposit_step deposit_step1">
                              {/* Deposit Form Step 3 */}
                              <Button
                                className="rounded-full p-0 h-8 w-8 absolute -top-12"
                                onClick={() => setStep("2")}
                              >
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
                                  onComplete={() => {
                                    console.log("Timer completed!");
                                    setStep("");
                                    const button = document.querySelector(".modal_close_brn");
                                    if (button) {
                                      button.click();
                                    }
                                  }}
                                >
                                  {({ remainingTime }) => (
                                    <span className="text-[12px]">
                                      {remainingTime}
                                    </span>
                                  )}
                                </CountdownCircleTimer>
                              </div>
                              <p className="text-4xl text-[#efefef] text-center font-semibold pt-5 pb-2">
                                {depsoitAmt ? depsoitAmt : 0}{" "}
                                {currency ? currency : ""}
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
                                    Wallet {shortText(address)}
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
                                    src={
                                      currency == "USDT"
                                        ? "/images/usdt.svg"
                                        : "/images/polygon.svg"
                                    }
                                    alt="Icon"
                                    width={18}
                                    height={18}
                                  />
                                  <span className="text-[14px] text-gray-200">
                                    {depsoitAmt ? depsoitAmt : 0}{" "}
                                    {currency ? currency : ""}
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
                                    {currency == "USDT"
                                      ? `${depsoitAmt} USDC`
                                      : `${tokenAmt} USDC`}
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
                                          $
                                          {gasAmt?.gasCost
                                            ? formatNumber(gasAmt?.gasCost, 4)
                                            : 0}
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
                                        $
                                        {gasAmt?.gasCost
                                          ? formatNumber(gasAmt?.gasCost, 2)
                                          : 0}
                                      </span>
                                    </div>

                                    <div className="flex gap-2 items-center justify-between py-1">
                                      <span className="text-[13px] text-gray-400">
                                        Market gas price
                                      </span>
                                      <span className="text-[13px] text-gray-200">
                                        {gasAmt?.marketGasCost
                                          ? formatNumber(gasAmt?.marketGasCost, 2)
                                          : 0}{" "}
                                        Gwei
                                      </span>
                                    </div>

                                    {/* <div className="flex gap-2 items-center justify-between py-1 border-b border-[#302f2f]">
                                      <span className="text-[13px] text-gray-400">
                                        LP cost
                                      </span>
                                      <span className="text-[13px] text-gray-200">
                                        $0.01
                                      </span>
                                    </div> */}
                                  </Accordion.Content>
                                </Accordion.Item>
                              </Accordion.Root>
                              {showallowance ? (
                                <Button
                                  className="mt-4 w-full"
                                  disabled={loader}
                                  onClick={() => approve()}
                                >
                                  Approve{" "}
                                  {loader && (
                                    <i
                                      className="fas fa-spinner fa-spin ml-2"
                                      style={{ color: "black" }}
                                    ></i>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  className="mt-4 w-full"
                                  disabled={loader}
                                  onClick={() => buy()}
                                >
                                  Confirm Order{" "}
                                  {loader && (
                                    <i
                                      className="fas fa-spinner fa-spin ml-2"
                                      style={{ color: "black" }}
                                    ></i>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                          <Dialog.Close asChild>
                            <button
                              className="modal_close_brn"
                              aria-label="Close"
                            >
                              <Cross2Icon />
                            </button>
                          </Dialog.Close>
                        </Dialog.Content>
                      </Dialog.Portal>
                    )}
                  </Dialog.Root>
                </div>

                <Dialog.Root open={txopen} onOpenChange={setTxOpen}>
                  <Dialog.Portal>
                    <Dialog.Overlay className="DialogOverlay fixed inset-0 bg-black/50 z-40" />
                    <Dialog.Content className="DialogContent fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
                      <Dialog.Title className="DialogTitle text-xl font-semibold text-center mb-4">
                        Transaction Completed
                      </Dialog.Title>

                      <div className="flex flex-col items-center text-center">
                        <svg
                          className="success"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 130.2 130.2"
                          width="80"
                          height="80"
                        >
                          <circle
                            className="path circle"
                            fill="none"
                            stroke="#73AF55"
                            strokeWidth="6"
                            strokeMiterlimit="10"
                            cx="65.1"
                            cy="65.1"
                            r="62.1"
                          />
                          <polyline
                            className="path check"
                            fill="none"
                            stroke="#73AF55"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeMiterlimit="10"
                            points="100.2,40.2 51.5,88.8 29.8,67.5"
                          />
                        </svg>

                        {/* <div className="text-light mt-4 text-lg">
                          You will receive: <strong>{currency == "USDT" ? `${depsoitAmt} USDC` : `${tokenAmt} USDC`}</strong>
                        </div> */}

                        {transactionHash && (
                          <a
                            className="text-blue-500 hover:underline mt-4 flex items-center gap-2"
                            href={`${config?.txLink}tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fa fa-eye" aria-hidden="true"></i>
                            View Transaction
                          </a>
                        )}
                      </div>

                      <Dialog.Close asChild>
                        <button
                          className="modal_close_btn absolute top-4 right-4 text-white hover:text-gray-400"
                          aria-label="Close"
                        >
                          <Cross2Icon />
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>

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
                      <Button className="w-full mb-1 bg-[#362020] text-[#e64800] hover:bg-[#e64800] hover:text-[#000000] transition-colors duration-300 rounded-full">
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
                              className="Input h-12 focus-visible:outline-none"
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
                              className="Input h-12 focus-visible:outline-none"
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
                  <span className={`mt-2 text-3xl font-semibold ${profitAmount >= 0 ? "text-green-600" : "text-red-500"}`}>{PnLFormatted(formatNumber(profitAmount,2))}</span>
                  <span className="text-sm text-gray-500 mt-1">
                    <span className={`${profitAmount >= 0 ? "text-green-600" : "text-red-500"}`}>$0.00 (0.00%)</span> Today
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
              {/* <div className="flex space-x-4 mb-3">
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
                              <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
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
                          <Button className="bg-[#e64800] text-[#fff] hover:text-[#000] w-[80px]">
                            Sell
                          </Button>
                          <Button className="w-[80px]">Share</Button>
                        </div>
                      </td>
                    </tr>

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
                              <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
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
                          <Dialog.Root>
                            <Dialog.Trigger asChild>
                              <Button className="bg-[#37ce37] text-[#fff] hover:text-[#000] w-[80px]">
                                Claim
                              </Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                              <Dialog.Overlay className="DialogOverlay" />
                              <Dialog.Content className="DialogContent">
                                <div className="flex justify-center mb-4 flex-col items-center">
                                  <Image
                                    src="/images/ipl_logo.png"
                                    alt="Icon"
                                    width={100}
                                    height={61}
                                    className="mb-2"
                                  />
                                  <h4 className="font-semibold">
                                    Redeem Chennai super kings
                                  </h4>
                                  <h6 className="text-sm text-gray-400">
                                    Chennai Super Kings vs. Rajasthan Royals
                                  </h6>
                                  <div className="bg-[#0e1c14] p-4 rounded-lg mt-4 w-full flex justify-center items-center flex-col">
                                    <h5 className="font-semibold text-gray-300 mb-3">
                                      Receive
                                    </h5>
                                    <div className="flex items-center space-x-2">
                                      <Image
                                        src="/images/money-bag.png"
                                        alt="Icon"
                                        width={32}
                                        height={32}
                                      />
                                      <p className="font-semibold text-[#27ae60] mb-0 text-[24px]">
                                        $0.00
                                      </p>
                                    </div>
                                  </div>
                                  <Button className="bg-[#37ce37] text-[#fff] hover:text-[#000] w-full mt-5 text-[14px] font-medium">
                                    Claim
                                  </Button>
                                </div>
                                <Dialog.Close asChild>
                                  <button
                                    className="modal_close_brn"
                                    aria-label="Close"
                                  >
                                    <Cross2Icon />
                                  </button>
                                </Dialog.Close>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>

                          <Dialog.Root>
                            <Dialog.Trigger asChild>
                              <Button className="w-[80px]">Share</Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                              <Dialog.Overlay className="DialogOverlay" />
                              <Dialog.Content className="DialogContent">
                                <Dialog.Title className="DialogTitle">
                                  Shill Your Bag
                                </Dialog.Title>
                                <div className="bg-[#0e1c14] p-4 rounded-lg mt-4 w-full">
                                  <div className="flex gap-3 mb-4 items-center">
                                    <Image
                                      src="/images/ipl_logo.png"
                                      alt="Icon"
                                      width={60}
                                      height={21}
                                      className="mb-2"
                                    />
                                    <h4 className="font-semibold">
                                      Chennai Super Kings vs. Rajasthan Royals
                                    </h4>
                                  </div>
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge className="z-10 text-[16px] text-[#27ae60] bg-[#1f3e2c] font-normal rounded">
                                      56x Chennai Super Kings
                                    </Badge>
                                    <span>Avg 52¢</span>
                                  </div>

                                  <Separator.Root
                                    className="SeparatorRoot"
                                    style={{ margin: "20px 0 15px" }}
                                  />

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-gray-400">Trade</h5>
                                      <p className="text-[#fff] mb-0 font-medium">
                                        $2.00
                                      </p>
                                    </div>
                                    <div>
                                      <h5 className="text-gray-400">To win</h5>
                                      <p className="text-[#27ae60] mb-0 font-semibold">
                                        $3.83
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 gap-3">
                                  <Button className="w-full bg-[transparent] border border-[#2d2d2d] text-[#fff] hover:text-[#000]">
                                    <CopyIcon className="h-4 w-4" />
                                    <span>Copy Image</span>
                                  </Button>
                                  <Button className="w-full">Share</Button>
                                </div>
                                <Dialog.Close asChild>
                                  <button
                                    className="modal_close_brn"
                                    aria-label="Close"
                                  >
                                    <Cross2Icon />
                                  </button>
                                </Dialog.Close>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div> */}
              <Positions/>
            </TabsContent>
            <TabsContent value="openorders">
              {/* <div className="flex space-x-4 mb-3">
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
              </div> */}
              <OpenOrders/>
            </TabsContent>
            <TabsContent value="history">
              {/* <div className="flex space-x-4 mb-3">
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
                        <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
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
                        <Badge className="z-10 text-xs text-[#e64800] bg-[#362020] font-normal">
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
              </div> */}
              <History/>
            </TabsContent>
          </Tabs>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="DialogTitle mb-4">
                Welcome to Sonotrade
              </Dialog.Title>
              <div className="flex gap-3 justify-between mt-4 sm:flex-nowrap flex-wrap">
                      <Button
                        onClick={() => ConnectPhantomWallet()}
                        className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]"
                      >
                        <Image
                          src={"/images/wallet_icon_02.png"}
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
      </div>
      <Footer />
    </>
  );
}
