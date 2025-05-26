"use client";
import Header from "@/app/Header";
import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
import { navigationItems } from "@/app/components/constants";
import React, { useState, useEffect, useCallback } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import Web3 from "web3";
import config from "../config/config"
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
import { shortText, numberFloatOnly } from "../helper/custommath"
import { useToast } from "../helper/toastAlert";
import isEmpty from "is-empty"
import {
  Cross2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  InfoCircledIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { getUserData, addressCheck } from "@/app/ApiAction/api"
import { useRouter } from "next/navigation";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Input } from "../components/ui/input";
import { useWallet } from "@/app/walletconnect/walletContext.js";
import { useWalletClient } from 'wagmi'
import { getCoinAmt, depsoitToken, depsoitCoin, approveToken ,getGasCostAmt} from "./multicall"
import { walletClientToSigner } from "../helper/ethersconnect";
import { formatNumber } from "../helper/custommath"
import tokenABI from "../ABI/TOKENABI.json"


let initialValue = {
  currency: "",
  amount: "",
  walletAddress: "",
}
export default function PortfolioPage() {
  const { connectors, address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [account, setaccount] = useState(address);
  const [data, setData] = useState(address);
  const [open, setOpen] = useState(false)
  const [check, setCheck] = useState(false)
  const [step, setStep] = useState("");
  const wallet = address;
  const [balance, setBalance] = useState(0)
  const [tokenbalance, setTokenBalance] = useState(0)
  const [currentTab, setCurrentTab] = useState("positions");
  const [depositData, setDepositData] = useState(initialValue);
  const [depsoitAmt, setDepositAmt] = useState(0);
  const [loader, setloader] = useState(false)
  const [txopen, setTxOpen] = useState(false)
  const [showallowance, setshowallowance] = useState(false)
  const [transactionHash, settransactionHash] = useState("")
  const [connval, setconnval] = useState(null)
  const [walletData, setWalletData] = useState({})
  const [tokenValue, setTokenValue] = useState({ minDeposit: 0, tokenAmt: 0, allowance: 0, usdConvt: 0 })
  const toastAlert = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState({ username: "", avatar_url: "", bio: "" })
  const [gasAmt, setGasAmt] = useState({ gasCost: 0, marketGasCost: 0,})


  var { currency, amount, walletAddress } = depositData
  var { minDeposit, tokenAmt, allowance ,usdConvt} = tokenValue

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

  const [interval, setInterval] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;



  const balanceData = async () => {
    try {
      const web3 = new Web3(config.rpcUrl);
      const balanceWei = await web3.eth.getBalance(address ? address : "");
      const balancePOL = web3.utils.fromWei(balanceWei, 'ether');
      const formattedBalance = parseFloat(balancePOL).toFixed(6);
      setBalance(formattedBalance);
      const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
      const decimals = await usdcContract.methods.decimals().call();
      const rawBalance = await usdcContract.methods.balanceOf(address).call();
      const formattedBalance1 = parseFloat(rawBalance / (10 ** decimals)).toFixed(4);
      setTokenBalance(formattedBalance1);

    } catch (err) {
      console.error("Error fetching POL balance:", err);
    }
  };



  var chainId = config.chainId;
  const { data: walletClient } = useWalletClient({ chainId });

  useEffect(() => {
    try {
      var { transport } = walletClientToSigner(walletClient);
      setconnval(transport);
      setaccount(address)
    } catch (err) { }
  }, [address, walletClient]);



  const connectMetamaskMobile = () => {

    const currentUrl = window.location.href;

    // Split the URL to get the dapp URL
    const urlParts = currentUrl.split("//");
    if (urlParts.length > 1) {
      const dappUrl = urlParts[1].split("/")[0];
      const metamaskAppDeepLink = "https://metamask.app.link/dapp/" + dappUrl;
      window.open(metamaskAppDeepLink, "_self");

    } else {
      console.error("Invalid URL format");
    }

  };

  function isMobile() {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }


  async function handleConnect(connector) {
    disconnectWallet();
    try {
      var network = config.chainId;

      let check = isMobile();
      var isType =
        connector && connector.id
          ? connector.id
          : "";

      if (check && !window.ethereum && isType == "MetaMask") {
        connectMetamaskMobile();
        return;
      } else {

        var web3 = null;
        if (isType == "injected") {
          web3 = new Web3(window.BinanceChain);
        } else if (isType !== "walletConnect") {
          web3 = new Web3(window.ethereum);
        } else {
          var rpcUrl = config.rpcUrl;
          web3 = new Web3(rpcUrl);
        }
        var currnetwork = await web3.eth.net.getId();

        if (
          parseInt(currnetwork) !== parseInt(network) &&
          isType !== "walletConnect"
        ) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: Web3.utils.toHex(network) }],
          });
          currnetwork = network;
        }
        let connect = await connectWallet(connector);
        setOpen(false)
        getUser()
        getAddress()
      }
    } catch (err) {
      console.log(err, "errerr")
      var error = err && err.message ? err.message.toString() : err.toString();
      var pos = error.search("Provider not set or invalid");
      var pos1 = error.search("User rejected");
      if (pos >= 0) {
        toastAlert("error", "Please login into metamask");
      } else if (pos1 >= 0) {
        toastAlert("error", "Confirmation is rejected");
      } else {
        toastAlert("error", "Please try again later");
      }
    }
  }

  const getCoinValue = async () => {
    try {
      const web3 = new Web3(config.rpcUrl);
      const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
      const decimals = await usdcContract.methods.decimals().call();
      let amt = (depsoitAmt * (10 ** decimals))
      console.log(amt, "depsoitAmtdepsoitAmt")
      let { minDeposit, tokenAmt, allowance, usdConvt } = await getCoinAmt(address, amt, connval)
      setTokenValue({ minDeposit, tokenAmt, allowance, usdConvt })
      
      //gasCostValues
      var gasPrice = await web3.eth.getGasPrice();
      var marketGasCost = (gasPrice / 1e9 * usdConvt)
      let estimateGas = 110171
      console.log(marketGasCost,'***********************21',usdConvt,gasPrice)
      var gasCost = (((gasPrice * estimateGas) / 1e18) * usdConvt)
      setGasAmt({marketGasCost:gasPrice / 1e9,gasCost})
    } catch (err) {
      console.log(err, "errr")
    }
  }


  const getAddress = async (address) => {
    try {
      const { result } = await addressCheck({ address });
      if (isEmpty(data?.walletAddress) && result === true ||
        !isEmpty(data?.walletAddress) && result === true) {
        disconnectWallet();
        localStorage.removeItem("sonoTradeToken");
        localStorage.removeItem("googlelogin");
        toastAlert("error", "You have been logged out. Please select the correct wallet address.");
        router.push("/");
        window.location.href = '/'
      } else if (!isEmpty(data?.walletAddress) && result === false ||
        isEmpty(data?.walletAddress) && result === false) {
        return;
      }
    } catch (error) {
      console.error("Error in getAddress:", error);
    }
  };


  useEffect(() => {
    if (isConnected == true) {
      getAddress(address)
    }
  }, [isConnected])

  // useEffect(() => {
  //   getCoinValue()
  // }, [depsoitAmt])

  useEffect(() => {
    balanceData()
  }, [address])

  var step2Click = () => {
    if (!isEmpty(currency)) {
      setStep("2")
      getCoinValue()
    } else {
      toastAlert("error", "Please select a currency")
    }
  }

  var step3Click = () => {
    try {
      var depositBalance = currency == "USDT" ? tokenbalance : balance
      if (depositBalance > 0) {
        if (isEmpty(depsoitAmt) || depsoitAmt < parseFloat(minDeposit)) {
          toastAlert("error", "Enter the amount must be greater than minimum deposit value",);
        } else if (currency == "POL" && depsoitAmt < 0.001) {
          toastAlert("error", `Enter the amount must be greater than minimum deposit value`,);
        }
        else if (depsoitAmt > 0) {
          setStep("3")
          getCoinValue()
        }
      } else if (depositBalance <= 0) {
        toastAlert("error", "Insufficient Balance",);
      }
    } catch (err) {
      console.log(err, "ererrrr")
    }
  }

  const getUser = async () => {
    try {
      console.log("userrr")
      let { status, result, wallet } = await getUserData()
      if (status) {
        setData(result)
        setWalletData(wallet)
      }
    } catch (err) {
      console.log(err, 'errr')
    }
  }


  const balanceChange = (value) => {
    if (currency == "USDT") {
      setDepositAmt(tokenbalance * (value / 100))
    } else {
      setDepositAmt(balance * (value / 100))
    }
  }



  async function disconnect() {
    disconnectWallet();
  }

  async function buy() {
    
    try {
      setloader(true)

      if (currency == "USDT") {
        var { status, txId, message } = await depsoitToken(address, depsoitAmt, connval);
        settransactionHash(txId);
        setloader(true);
        if (status) {
          toastAlert(
            "success",
            "Your transaction is successfully completed",
          );
          setDepositAmt(0);
          setStep("")
          setTxOpen(true)
          const button = document.querySelector('.modal_close_brn');
          if (button) {
            button.click();
          }
          await getUser()
        } else {
          toastAlert("error", message);
        }
        setloader(false);

      } else if (currency == "POL") {
        var { status, txId, message } = await depsoitCoin(address, depsoitAmt, connval);
        settransactionHash(txId)
        setloader(true);
        if (status) {
          toastAlert(
            "success",
            "Your transaction is successfully completed",
          );
          setDepositAmt(0);
          setStep("")
          setTxOpen(true)
          const button = document.querySelector('.modal_close_brn');
          if (button) {
            button.click();
          }
          await getUser()
        } else {
          toastAlert("error", message);
        }
        setloader(false);
      }
    } catch (err) {
      setloader(false);

    }
  }

  const handlechange = async (e) => {
    let value = e.target.value;
    setDepositAmt(e.target.value)
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
      var { approvalAmt, isAllowed, error } = await approveToken(address, connval);
      if (isAllowed) {
        if (depsoitAmt > approvalAmt) {
          toastAlert("error", "Insufficient approval amount");
        } else {
          toastAlert("success", "Successfully approved");
          setshowallowance(false);
        }
      } else {
        toastAlert("error", error);
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
      setStep("1")
      setDepositAmt(0)
      getCoinValue()
      setTxOpen(false)
    } else {
      toastAlert("error", "Connect Your Wallet")
    }
  }
  useEffect(() => {
    if (isLogin() == false) {
      window.location.href = '/'
    }
    getUser()
  }, [])
  console.log(data, data?.loginType,tokenAmt, "datadatadata")
  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-full backdrop-blur-md">
        <Header />
        <NavigationComponent menuItems={navigationItems} showLiveTag={true} />
      </div>
      <div className="container mx-auto py-10 px-4 container-sm">
        {!isEmpty(data) && data?.loginType !== "wallet" && (
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
        )}

        <br></br>
        {/* 2. Key metrics card area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#131212] p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex flex-col items-left">
                <span className="text-sm text-gray-500 mt-1">PORTFOLIO</span>
                <span className="mt-2 text-3xl font-semibold">${walletData?.balance ? formatNumber(walletData?.balance, 4) : 0}</span>
                <span className="text-sm text-gray-500 mt-1">
                  <span className="text-green-500">$0.00 (0.00%)</span> Today
                </span>
              </div>
              <Badge className="z-10 text-sm text-white bg-[#00c735] font-normal">
                ${walletData?.balance ? formatNumber(walletData?.balance, 4) : 0}
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

                <Dialog.Root >
                  <Dialog.Trigger asChild>
                    <Button onClick={() =>
                      iniDepsotClick()
                    } className="w-full mb-1 bg-[#152632] text-[#7dfdfe] hover:bg-[#7dfdfe] hover:text-[#000000] transition-colors duration-300 rounded-full">
                      Deposit
                    </Button>
                  </Dialog.Trigger>
                  {isConnected == true && txopen == false &&
                    <Dialog.Portal>
                      <Dialog.Overlay className="DialogOverlay" />
                      <Dialog.Content className="DialogContent">
                        {(step == '1' || step == '2' || step == '3') && <Dialog.Title className="DialogTitle">
                          Deposit
                        </Dialog.Title>}
                        {(step == '1' || step == '2' || step == '3') && <p className="text-center text-[12px] text-gray-400 mb-0">
                          Available Balance: $ {currency === "USDT"
                            ? `${tokenbalance} ${currency}`
                            : `${formatNumber(balance * usdConvt, 4)} ${currency}`}
                        </p>}
                        {step == '1' && (
                          <div className="deposit_step deposit_step1">
                            {/* Wallet Info Button */}
                            <Button className="mt-4 w-full google_btn flex-col items-start">
                              <p className="text-[12px] text-gray-400 mb-0">Deposit from</p>
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
                                className={`flex items-center justify-between my-3 border px-3 py-1 rounded cursor-pointer transition ${depositData.currency === "USDT"
                                  ? "border-[#4f99ff] bg-[#1a1a1a]" // Highlight when selected
                                  : "border-[#3d3d3d] hover:bg-[#1e1e1e]"
                                  }`}
                                onClick={() =>
                                  setDepositData((prev) => ({ ...prev, currency: "USDT" }))
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
                                    <span className="text-[12px] text-gray-400">{tokenbalance} USDT</span>
                                  </div>
                                </div>
                                <span className="text-[14px]">$ {tokenbalance}</span>
                              </div>
                            </div>


                            <div className="wallet_coin_list">
                              <div
                                className={`flex items-center justify-between my-3 border px-3 py-1 rounded cursor-pointer transition ${depositData.currency === "POL"
                                  ? "border-[#4f99ff] bg-[#1a1a1a]" // Highlight when selected
                                  : "border-[#3d3d3d] hover:bg-[#1e1e1e]"
                                  }`}
                                onClick={() =>
                                  setDepositData((prev) => ({ ...prev, currency: "POL" }))
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
                                    <span className="text-[12px] text-gray-400">{balance} POL</span>
                                  </div>
                                </div>
                                <span className="text-[14px]">
                                  {/* $9.88 */}
                                  $ {formatNumber(balance * usdConvt, 4)}
                                </span>
                              </div>
                            </div>

                            <Button className="mt-4 w-full" onClick={() => step2Click()}>
                              Continue
                            </Button>
                          </div>
                        )}
                        {step == '2' && (
                          <div className="deposit_step deposit_step1">
                            {/* Deposit Form Step 2 */}
                            <Button className="rounded-full p-0 h-8 w-8 absolute -top-12" onClick={() => setStep("1")}>
                              <ChevronLeftIcon />
                            </Button>
                            <input
                              className="wallet_inp"
                              type="number"
                              onChange={handlechange}
                              value={depsoitAmt}
                              placeholder={depsoitAmt}
                            />
                            <div className="flex gap-3 justify-between mt-4 sm:flex-nowrap flex-wrap">
                              <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                onClick={() => balanceChange(25)}>
                                25%
                              </Button>
                              <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                onClick={() => balanceChange(50)}>
                                50%
                              </Button>
                              <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                onClick={() => balanceChange(75)}>
                                75%
                              </Button>
                              <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333] text-[#efefef]"
                                onClick={() => balanceChange(100)}>
                                Max
                              </Button>
                            </div>
                            <p className="text-[12px] text-gray-400 text-center mt-8">
                              {currency === "POL" ? (
                                `${0.001} minimum deposit`
                              ) : (
                                `${minDeposit} ${currency} minimum deposit`
                              )}

                            </p>
                            <div
                              className="flex gap-3 items-center justify-between sm:flex-nowrap flex-wrap py-3 px-4 border border-[#3d3d3d] rounded-full sm:w-[60%] w-[100%] m-auto mt-3
                        "
                            >
                              <div className="flex items-center gap-2">
                                <Image
                                  src={currency == "USDT" ? "/images/usdt.svg" : "/images/polygon.svg"}
                                  alt="Icon"
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                                <div className="flex flex-col">
                                  <span className="text-[12px] text-gray-400">
                                    You Sent
                                  </span>
                                  <span className="text-[14px]">{currency}</span>
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
                            <Button className="mt-4 w-full" onClick={() => step3Click()}>Continue</Button>
                          </div>
                        )}
                        {step == '3' && (
                          <div className="deposit_step deposit_step1">
                            {/* Deposit Form Step 3 */}
                            <Button className="rounded-full p-0 h-8 w-8 absolute -top-12" onClick={() => setStep("2")}>
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
                                  setStep("")
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
                              {depsoitAmt ? depsoitAmt : 0} {currency ? currency : ""}
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
                                  src={currency == "USDT" ? "/images/usdt.svg" : "/images/polygon.svg"}
                                  alt="Icon"
                                  width={18}
                                  height={18}
                                />
                                <span className="text-[14px] text-gray-200">
                                  {depsoitAmt ? depsoitAmt : 0} {currency ? currency : ""}
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
                                  {currency == "USDT" ? `${depsoitAmt} USDC` : `${tokenAmt} USDC`}
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
                                      ${gasAmt?.gasCost ? formatNumber(gasAmt?.gasCost,4) : 0}
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
                                      ${gasAmt?.gasCost ? formatNumber(gasAmt?.gasCost,4) : 0}
                                    </span>
                                  </div>

                                  <div className="flex gap-2 items-center justify-between py-1">
                                    <span className="text-[13px] text-gray-400">
                                      Market gas price
                                    </span>
                                    <span className="text-[13px] text-gray-200">
                                      {gasAmt?.marketGasCost ? formatNumber(gasAmt?.marketGasCost,4) : 0} Gwei
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
                            {showallowance ?
                              <Button className="mt-4 w-full" disabled={loader} onClick={() => approve()}>Approve {loader && <i
                                className="fas fa-spinner fa-spin ml-2"
                                style={{ color: "black" }}
                              ></i>}</Button> :
                              <Button className="mt-4 w-full" disabled={loader} onClick={() => buy()}>Confirm Order {loader && <i
                                className="fas fa-spinner fa-spin ml-2"
                                style={{ color: "black" }}
                              ></i>}</Button>}
                          </div>
                        )}
                        <Dialog.Close asChild>
                          <button className="modal_close_brn" aria-label="Close">
                            <Cross2Icon />
                          </button>
                        </Dialog.Close>
                      </Dialog.Content>
                    </Dialog.Portal>
                  }
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
                          href={`${config.txLink}tx/${transactionHash}`}
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
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle mb-4">
              Welcome to Sonotrade
            </Dialog.Title>
            <div className="flex gap-3 justify-between mt-4 sm:flex-nowrap flex-wrap">
              {connectors.map((connector, i) => {
                if (
                  connector.name == "MetaMask" || connector.name == "WalletConnect"
                ) {
                  return (
                    <Button onClick={() => handleConnect(connector)} className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]">
                      <Image
                        src={
                          connector.name == "MetaMask"
                            ? "/images/wallet_icon_01.png"
                            : "/images/wallet_icon_05.png"
                        }
                        alt="Icon"
                        width={40}
                        height={40}

                      />
                    </Button>
                  );
                }
              })}

            </div>
            <Dialog.Close asChild>
              <button className="modal_close_brn" aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div >
  );
}
