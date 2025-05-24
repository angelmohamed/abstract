"use client"; // Add this at the top of the file to enable client-side hooks
import Link from "next/link";
import Image from "next/image";

import SearchBar from "@/app/components/ui/SearchBar";
import SONOTRADE from "@/public/images/logo.png";
import React, { useState, useEffect,  } from "react";
import { client } from "@/app/client";
import { useRouter } from "next/navigation";
import { DropdownMenu, Tooltip, Separator, Dialog } from "radix-ui";
import { WalletClient, useWalletClient } from 'wagmi'
import { useWallet } from "@/app/walletconnect/walletContext.js";
import { walletClientToSigner } from "./helper/ethersconnect.js";
import Web3 from "web3";
import {
  ChevronDownIcon,
  OpenInNewWindowIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import config from "./config/config.js"
import { formatNumber ,shortText} from "../app/helper/custommath.js"
import { Button } from "./components/ui/button";
import { useToast } from "./helper/toastAlert.js";
import { googleLogin, getUserLocation, register,verifyEmail ,resendOTP, walletLogin,getUserData} from "./ApiAction/api.js"
import { regInputValidate, regValidate,otpValidate,otpInputValidate } from "./validation/validation.js"
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import isEmpty from "is-empty"
import Authentication from "./Authentication.jsx";

let initialData = {
  otp: "",
};
let initialValue = {
  email: "",
};

export default function Header() {
  const router = useRouter();
  
  const [connval, setconnval] = useState(null)
  const [open, setOpen] = useState(false)
  const [loader, setloader] = useState(false)
  const [otpopen, setOtpOpen] = useState(false)
  const [userData, setUserData] = useState("")
  const [otpData, setOtpData] = useState(initialData);
  const [LoginHistory, setLoginHistory] = useState({});
  const [error, setError] = useState({})
  const [connect, setIsConnect] = useState(false)
  const [data, setData] = useState({})
  const [walletData, setWalletData] = useState({})
  const [currentPosition, setCurrentPosition] = useState("$0.00");
  const [verifystatus, setVerifyStatus] = useState(false);
  const [account, setaccount] = useState("");
  //const wallet = useWallet();
  const [expireTime, setExpireTime] = useState(0);

  const { connectors, address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const toastAlert = useToast();
  let { email } = userData
  let { otp } = otpData

  let registerChange = (e) => {
    let { name, value, } = e.target;
    const resetData = { ...userData, [name]: value };
    delete error[name];
    setUserData(resetData);
    let errMsg = regInputValidate(resetData, name);
    setError({ ...error, ...errMsg });
  };


  // navigation handlers
  const navigateToProfilePage = () => {
    router.push("/profile");
  };
  const navigateToPortfolioPage = () => {
    router.push("/portfolio");
    window.location.href = '/portfolio'
  };

  var chainId = config.chainId;
  const { data: walletClient } = useWalletClient({ chainId });

  useEffect(() => {
    if (!isConnected || !walletClient || !address) return;
  
    try {
      const { transport } = walletClientToSigner(walletClient);
      setconnval(transport);
      setaccount(address);
    } catch (err) {
      console.error(err);
    }
  }, [address, walletClient, isConnected]);
  

  

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
      //  const message = "Welcome to SonoTrade! Sign to connect.";
      //  const signature = await web3.eth.personal.sign(message, account);
      setIsConnect(true)
      setOpen(false)
      walletAdd()
        // var signature = await Web3.eth.personal.sign("Wlcome to SonoTrade! Sign to connect.", address, 'SonoTrade');
      }
    } catch (err) {
      console.log(err,"errerr")
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

  const getUserLogindetails = async () => {
    try {
      let result = await getUserLocation();
      setLoginHistory(result);
    } catch (err) {
      console.error("Failed to get user location", err);
    }
  };

  let getTime = async () => {
    if (expireTime > 0) {
      setTimeout(() => {
        if (expireTime != 0) {
          setExpireTime(expireTime - 1);
        }
      }, 1000);
    }
  };


  const walletAdd = async(address) =>{
    var walletdata = {
      address:address ,
      LoginHistory
    }
    let { status , authToken } = await walletLogin(walletdata)
    console.log( status , authToken ," status , authToken ")
    if(status){
      localStorage.setItem("sonoTradeToken", authToken);
      toastAlert("success", "Wallet Connected Successfully",);
      getUser()
    }
  }

  useEffect(() => {
    const handleWalletAdd = async () => {
      if (isConnected && connect) {
        console.log(address,'connecttt')
        await walletAdd(address)
      }
    }

    handleWalletAdd()
  }, [isConnected])


  useEffect(() => {
    if (expireTime > 0) {
      getTime();
    }
  }, [expireTime]);

  useEffect(() => {
    getUserLogindetails();
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    console.log("Google Token:", token);

    try {
      let data = {
        token,
        LoginHistory: LoginHistory,
      };
      let { status, message, authToken, errors } = await googleLogin(data);
      console.log(authToken, "authTokenauthTokenauthToken");

      if (status) {
        console.log("Login Successful:", message);
        localStorage.setItem("sonoTradeToken", authToken);
        localStorage.setItem("googlelogin", true);
        toastAlert("success", message);
        setOpen(false)
        getUser()
      } else {
        console.error("Login Failed:", message, errors);
        toastAlert("error", message);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  let handleClick = async () => {
    try {
      let errMsg = await regValidate(userData);
      setError(errMsg);
      if (isEmpty(errMsg)) {
        setloader(true)
        let { status, message, errors } = await register(userData);
        console.log(errors, 'errorserrors')
        if (status == true) {
          toastAlert("success", message);
          setVerifyStatus(true);
          setExpireTime(180);
          setOtpOpen(true)
          setOpen(false)
          setloader(false)
          getTime();
        } else if (!isEmpty(errors)) {
          setError(errors);
          return;
        } else {
          toastAlert("error", message);
        }
      }
    } catch (err) {
      console.log(err, "errr");
    }
  };

  let handleOtpChange = (e) => {
    let { name, value } = e.target;
    var resetData = { ...otpData, ...{ [name]: value } };
    delete error[name];
    setOtpData(resetData);
    let errMsg = otpInputValidate(resetData, name);
    setError({ ...error, ...errMsg });
};

let handleOtpClick = async () => {
    try {
      console.log("onCLick")
        let errMsg = await otpValidate(otpData);
        setError(errMsg);
        if (isEmpty(errMsg)) {
            if (expireTime == 0) {
                toastAlert("error", "OTP expired,Please resend", "otp");
                setOtpData({})
            } else {
              setloader(true)
                let data = { otp, email ,LoginHistory: LoginHistory,};
                let { message, status ,authToken} = await verifyEmail(data);
                if (status == true) {
                    toastAlert("success", message);
                    localStorage.setItem("sonoTradeToken", authToken);
                    setOtpOpen(false)
                    getUser()
                    setloader(false)
                } else {
                    toastAlert("error", message);
                }
            }
        }
    } catch (err) {
        console.log(err, "err");
    }
};

let resendCode = async () => {
    try {
        let data = {
            email,
        };
        let { message, status } = await resendOTP(data);
        if (status == true) {
            toastAlert("success", message, "otp");
            setExpireTime(180);
            getTime();
            setisLoad(false);
        } else {
            toastAlert("error", message, "otp");
            setisLoad(false);
        }
    } catch (err) {
        console.log(err, "err");
    }
};

  const isLogin = () => {
    if (localStorage.getItem("sonoTradeToken")) {
      return true;
    }
    return false;
  };

  const getUser = async() =>{
    try{
    let {status ,result,wallet} = await getUserData()
    if(status){
      setData(result)
      setWalletData(wallet)
     }
    }catch(err){
      console.log(err,'errr')
    }
  }


  async function logout() {
    localStorage.removeItem("sonoTradeToken");
    localStorage.removeItem("googlelogin");
    disconnectWallet();
    toastAlert("success", "Successfully Logout");
    window.location.href = '/'
    router.push("/");
  }

  useEffect(() =>{
    if(isLogin() == true){
      getUser()
    }
  },[])
console.log(email,data,"emaillll")
  return (
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent md:h-16 h-auto pt-2 container mx-auto">
      {console.log("88888888888888888888")}
      <div className="flex w-full md:w-auto items-center justify-between p-0 md:ml-6 ml-0 overflow-hidden">
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
          <Authentication />
          {/* {account && (
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
              onClick={navigateToProfilePage}
            >
              <div className="text-xs text-grey">Profile</div>
            </button>
          )} */}
          
        </div>
      </div>

      {/* Search Bar - Now visible on all screen sizes as second row on mobile/sm */}
      <div className="w-full px-4 pb-2 md:pb-0 md:pl-[2%] md:pr-[2%] mt-1 md:mt-0">
        <SearchBar placeholder="Search markets or artists" className="lg:max-w-[600px] min-w-[400px]" />
      </div>

      {/* Auth Buttons - For md+ screens, keep their original position */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToPortfolioPage}
          >
            <div className="text-l" style={{ color: "#33ff4c" }}>
              {walletData?.balance ? formatNumber(walletData?.balance,4) : 0}
            </div>
            <div className="text-xs text-grey">Portfolio</div>
          </button>
        {/* {account && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToProfilePage}
          >
            <div className="text-xs text-grey">Profile</div>
          </button>
        )} */}
        
      {isLogin() == true && 
          <Button onClick = {() => navigateToPortfolioPage()}>Deposit</Button>
      }
        <Dialog.Root open={open} onOpenChange={setOpen}>
          {!isLogin() == true && 
          <>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              Log In
            </Button>
          </Dialog.Trigger>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="sm" className="bg-blue-500" onClick={() => setOpen(true)}>
              Sign Up
            </Button>
          </Dialog.Trigger>
          </>
        }
      
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="DialogTitle mb-4">
                Welcome to Sonotrade
              </Dialog.Title>
              <GoogleOAuthProvider clientId={config.clientId}>
                <div className="google_login">
                  <GoogleLogin
                    theme="filled_black"
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log("Login Failed")}
                  />
                </div>
              </GoogleOAuthProvider>
              {/* <Button className="mt-4 w-full google_btn">
                <Image
                  src="/images/google_icon.png"
                  alt="Profile Icon"
                  width={24}
                  height={27}
                  className="rounded-full"
                />
                <span>Continue with Google</span>
              </Button> */}
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
                  name="email"
                  value={email}
                  onChange={registerChange}
                  placeholder="Enter Email"
                />               
                <Button onClick={handleClick} disabled = {loader}>Continue {loader &&  <i
                              className="fas fa-spinner fa-spin ml-2"
                              style={{ color: "black" }} 
                            ></i>}</Button>             
              </div>
              {error && error.email && (
                  <span style={{ color: "red" }}>{error.email}</span>
                )}
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
                {/* <Button className="w-full h-13 bg-[#1e1e1e] border border-[#3d3d3d] hover:bg-[#333]">
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

                </Button> */}
              </div>
              <Dialog.Close asChild>
                <button className="modal_close_brn" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        {verifystatus == true &&
          <Dialog.Root open={otpopen} onOpenChange={setOtpOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="DialogOverlay" />
              <Dialog.Content className="DialogContent">
                <Dialog.Title className="DialogTitle">
                 Verify Your Email
                </Dialog.Title>
                <div className="custom_grpinp">
                  <input
                    className="Input"
                    type="otp"
                    name="otp"
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="Enter OTP"
                  />
                    {expireTime == 0 ? (
                      <Button onClick={resendCode} >
                        Resend OTP 
                      </Button>
                    ) : (
                      <Button >{`${expireTime}`}</Button>
                    )}
                  {/* <Button>Continue</Button> */}
                </div>
                {error && error.otp && (
                  <span style={{ color: "red" }}>{error.otp}</span>
                )}
                <br></br>
                <div className="text-center">
                  <Button onClick = {() => handleOtpClick()} disabled = {loader}>Submit {loader &&  <i
                              className="fas fa-spinner fa-spin ml-2"
                              style={{ color: "black" }} 
                            ></i>}</Button>
                </div>
                <Dialog.Close asChild>
                  <button className="modal_close_brn" aria-label="Close">
                    <Cross2Icon />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        }
        {isLogin() == true  ?
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
                  className="profile_menu"
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
                      <span className="text-sm text-gray-100">{data?.name ? data?.name : ""}</span>
                      <div className="text-sm text-gray-100 flex items-center space-x-2">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="IconButton bg-[#131212] px-2 py-1 rounded">
                                <span className="text-[12px]">{address ? shortText(address) : ""}</span>
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
                    <Link href="/" onClick={logout}>Logout</Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </div>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          :""
        }
      {/* <Authentication /> */}
      </div>
    </header>
  );
}
