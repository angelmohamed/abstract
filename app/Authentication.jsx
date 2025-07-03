"use client"; // Add this at the top of the file to enable client-side hooks
import Link from "next/link";
import Image from "next/image";

import { useSelector } from "@/store";
import SONOTRADE from "@/public/images/logo.png";
import React, { useState, useEffect ,useCallback,useRef} from "react";
import { useRouter } from "next/navigation";
import { DropdownMenu, Tooltip, Separator, Dialog } from "radix-ui";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import {
  ChevronDownIcon,
  OpenInNewWindowIcon,
  Cross2Icon,
  BellIcon,
} from "@radix-ui/react-icons";
import config from "../config/config.js";
import { Button } from "./components/ui/button";
import { toastAlert } from "../lib/toast.js"
import {
  regInputValidate,
  regValidate,
  otpValidate,
  otpInputValidate,
} from "./validation/validation.js";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  googleLogout,
} from "@react-oauth/google";
import isEmpty from "is-empty";
import { formatNumber, shortText } from "../app/helper/custommath.js";
import { getLocation, googleLogin, register, resendOTP, verifyEmail, walletLogin } from "@/services/auth";
import { saveWalletEmail } from "@/services/wallet"
import { useDispatch } from "react-redux";
import { reset } from "../store/slices/auth/userSlice"
import { signOut } from "@/store/slices/auth/sessionSlice";
import { setWalletConnect } from "@/store/slices/walletconnect/walletSlice";
import local from "next/font/local/index.js";
import { availableBalance } from "@/lib/utils.js";
import { Connection, PublicKey } from '@solana/web3.js';
import { PnLFormatted } from "@/utils/helpers.js";
import { Copy } from "lucide-react";

let initialData = {
  otp: "",
};
let initialValue = {
  email: "",
};

export default function Authentication() {
  const router = useRouter();
  const dispatch = useDispatch();
  const previousWalletRef = useRef(null);
  
  const { signedIn } = useSelector((state) => state.auth?.session);
  const data = useSelector(state => state?.auth?.user);
  const walletData = useSelector((state) => state?.wallet?.data);
  const { isConnected, address, balance } = useSelector((state) => state?.walletconnect?.walletconnect);

  const [open, setOpen] = useState(false);
  const [loader, setloader] = useState(false);
  const [otpopen, setOtpOpen] = useState(false);
  const [userData, setUserData] = useState(initialValue);
  const [otpData, setOtpData] = useState(initialData);
  const [LoginHistory, setLoginHistory] = useState({});
  const [error, setError] = useState({});
  const [connect, setIsConnect] = useState(false);
  const [verifystatus, setVerifyStatus] = useState(false);
  const [walletEmail, setWalletEmail] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  //const wallet = useWallet();
  const [expireTime, setExpireTime] = useState(0);

  //get proileImg from redux
  const { profileImg } = useSelector(state => state.auth.user);
  let { email } = userData;
  let { otp } = otpData;

  let registerChange = (e) => {
    let { name, value } = e.target;
    const resetData = { ...userData, [name]: value };
    delete error[name];
    setUserData(resetData);
  };

  // navigation handlers
  const navigateToProfilePage = () => {
    router.push("/profile");
  };
  const navigateToPortfolioPage = () => {
    // router.push("/portfolio");
    window.location.href = "/portfolio";
  };

  async function ConnectPhantomWallet() {
    if (window.solana && window.solana.isPhantom) {
      try {
        if (window.solana.isConnected) {
          await window.solana.disconnect();
        }
        const response = await window.solana.connect();

        const message = 
        `Welcome to SonoTrade! - Sign to connect 

        URI : ${window.location.origin} 
        Network : ${config.networkType}
        Solana Account: ${response.publicKey.toString()}`
        const encodedMessage = new TextEncoder().encode(message);


        const signedMessage = await window.solana.signMessage(encodedMessage, "utf8");

        console.log("Signature:", signedMessage);
   if(signedMessage){
        const connection = new Connection(config?.rpcUrl);

        const publicKey = new PublicKey(response.publicKey.toString());
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / 1e9;
        console.log(balanceSOL, balanceLamports, 'balanceSOLbalanceSOL')
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
        setIsConnect(true);
        setOpen(false);
        walletAdd();
   }
      } catch (err) {
        console.log(err, "errerr");
        if (err?.code === 4001) {
          toastAlert("error", "Connection request was rejected", "wallet");
        }
        dispatch(
          setWalletConnect({
            isConnected: false,
            address: "",
            network: "",
            type: "",
            rpc: "",
            balance: 0
          }));
        toastAlert("error", "Failed to connect wallet", "wallet");
        setIsConnect(true);
        setOpen(false);
      }
    } else {
      toastAlert("error", "Phantom wallet extension is not installed", "error");
    }
  }

  async function disconnectWallet() {
    if (window.solana && window.solana.isPhantom) {
      window.solana.disconnect();
      dispatch(
        setWalletConnect({
          isConnected: false,
          address: "",
          network: "",
          type: "",
          rpc: "",
          balance: 0
        }));
    }
  }

  const getUserLogindetails = async () => {
    try {
      let result = await getLocation();
      setLoginHistory(result);
    } catch (err) {
      console.error("Failed to get user location", err);
    }
  };

  let getTime = async () => {
    if (expireTime > 0) {
      setTimeout(() => {
        if (expireTime != 0) {
          setExpireTime(prev => (prev > 1 ? prev - 1 : 0));
        }
      }, 1000);
    }
  };

  const walletAdd = async (address) => {
    if (isConnected) {
      var valuedata = {
        address: address,
        LoginHistory,
      };
      let { success, message, result } = await walletLogin(valuedata, dispatch);
      if (success) {
        if (isEmpty(result?.user?.email) && address || result?.user?.status == "unverified") {
          setWalletEmail(true)
          setEmailOpen(true)
          setUserData({})
          setExpireTime(0)
        } else {
          setOpen(false);
          toastAlert("success", message, "login");
        }
      } else {
        toastAlert("error", message, "login");
      }
    }
  };

  useEffect(() => {
    const handleWalletAdd = async () => {
      if (isConnected && connect) {
        console.log(address, "connecttt");
        await walletAdd(address);
      }
    };

    handleWalletAdd();
  }, [isConnected]);

  useEffect(() => {
    if (expireTime > 0 && expireTime != 0) {
      getTime();
    }
  }, [expireTime]);

  useEffect(() => {
    getUserLogindetails();
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;
    // console.log("Google Token:", token);

    try {
      let data = {
        token,
        LoginHistory: LoginHistory,
      };
      let { success, message } = await googleLogin(data, dispatch);
      console.log(message, success, "message")
      if (success) {
        setOpen(false);
        toastAlert("success", message, "login");
      } else {
        toastAlert("error", message, "login");
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
        let { success, message, errors } = await register(userData);
        console.log(errors, "errorserrors");
        if (success) {
          toastAlert("success", message, "login");
          setVerifyStatus(true);
          setExpireTime(180);
          setOtpOpen(true);
          setOpen(false);
          getTime();
          setOtpData(initialData)
        } else if (!isEmpty(errors)) {
          setError(errors);
          return;
        } else {
          toastAlert("error", message, "login");
        }
      }
    } catch (err) {
      // console.log(err, "errr");
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
      // console.log("onCLick");
      let errMsg = await otpValidate(otpData);
      setError(errMsg);
      if (isEmpty(errMsg)) {
        if (expireTime == 0) {
          toastAlert("error", "OTP expired,Please resend");
          setOtpData({});
        } else {
          let data = { otp, email, LoginHistory: LoginHistory };
          let { message, success } = await verifyEmail(data, dispatch);
          if (success) {
            toastAlert("success", message, "login");
            setOtpOpen(false);
            setOtpData({});
          } else {
            toastAlert("error", message, "login");
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
      let { message, success } = await resendOTP(data);
      if (success) {
        toastAlert("success", message, "login");
        setExpireTime(180);
        getTime();
      } else {
        toastAlert("error", message, "login");
      }
    } catch (err) {
      console.log(err, "err");
    }
  };


  let walletEmailClick = async () => {
    try {
      let errMsg = await regValidate(userData);
      setError(errMsg);
      if (isEmpty(errMsg)) {
        userData.address = address
        let { success, message } = await saveWalletEmail(userData);
        if (success) {
          setVerifyStatus(true);
          setWalletEmail(false)
          setEmailOpen(false)
          setExpireTime(180);
          setOtpOpen(true);
          setOpen(false);
          getTime();
          setOtpData(initialData)
        } else {
          toastAlert("error", message, "login");
          setUserData({ email: "" })
        }
      }
    } catch (err) {
      console.log(err, "errr");
    }
  };

  async function logout() {
    disconnectWallet();
    document.cookie = "user-token" + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    dispatch(reset());
    dispatch(signOut());
    toastAlert("success", "Logged out successfully", "logout");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await window.solana.connect({ onlyIfTrusted: true });
        const newPublicKey = res?.publicKey?.toString()?.toLowerCase();
        const savedAddress = data?.walletAddress?.toLowerCase();
  
        if (!previousWalletRef.current) {
          previousWalletRef.current = newPublicKey;
        }
  
        if (
          newPublicKey &&
          savedAddress &&
          newPublicKey !== previousWalletRef.current &&
          newPublicKey !== savedAddress
        ) {
          console.log("🔁 Wallet switched from", previousWalletRef.current, "to", newPublicKey);
  
          if (isConnected) {
            disconnectWallet();
            document.cookie =
              "user-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            dispatch(reset());
            dispatch(signOut());
            toastAlert(
              "error",
              `Logged out: please reconnect with your wallet address ${data?.walletAddress}`,
              "logout"
            );
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          }
        }
  
        previousWalletRef.current = newPublicKey;
      } catch (err) {
        console.warn("Phantom not connected yet");
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [data?.walletAddress, isConnected]);

  

  // console.log(address, balance ,"addresss")
 
  return (
    <>
      {/* {signedIn && (
        <Button onClick={() => navigateToPortfolioPage()}>Deposit</Button>
      )} */}
      {signedIn && (
        <button
          className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
          onClick={() => navigateToPortfolioPage()}
        >
          <div className="text-l text-[#33ff4c]">{PnLFormatted(formatNumber(walletData?.balance - walletData?.locked + walletData?.position, 2))}</div>
          <div className="text-xs text-grey">Portfolio</div>
        </button>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        {!signedIn && (
          <>
            <Dialog.Trigger asChild>
              <Button variant="outline" size="sm" onClick={() => {
                setOpen(true)
                setUserData({ email: "" })
                setExpireTime(0)
                setError({})
                disconnectWallet()
              }}>
                Log In
              </Button>
            </Dialog.Trigger>
            <Dialog.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500"
                onClick={() => {
                  setOpen(true)
                  setUserData({ email: "" })
                  setExpireTime(0)
                  setError({})
                  disconnectWallet()
                }
                }
              >
                Sign Up
              </Button>
            </Dialog.Trigger>
          </>
        )}

        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <Dialog.Title className="DialogTitle mb-4">
              Welcome to Sonotrade
            </Dialog.Title>
            <GoogleOAuthProvider clientId={config?.clientId}>
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
                className="Input focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                type="email"
                name="email"
                value={email}
                onChange={registerChange}
                placeholder="Enter Email"
              />
              <Button onClick={handleClick} disabled={loader}>
                Continue{" "}
                {loader && (
                  <i
                    className="fas fa-spinner fa-spin ml-2"
                    style={{ color: "black" }}
                  ></i>
                )}
              </Button>
            </div>
            {error && error?.email && (
              <span style={{ color: "red" }}>{error?.email}</span>
            )}
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

      {verifystatus == true && (
        <Dialog.Root open={otpopen} onOpenChange={setOtpOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <div className="text-center">
                <Image
                  src={SONOTRADE}
                  alt="Profile Icon"
                  width={200}
                  height={200}
                  className="mx-auto rounded-full"
                />
              </div><br />
              <Dialog.Title className="DialogTitle">
                Verify Your Email
              </Dialog.Title><br />
              <div className="custom_grpinp">
                <input
                  className="Input focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  type="otp"
                  name="otp"
                  value={otp ? otp : ""}
                  onChange={handleOtpChange}
                  placeholder="Enter OTP"
                />
                {expireTime == 0 ? (
                  <Button onClick={resendCode}>Resend OTP</Button>
                ) : (
                  <Button>{`${expireTime}`}</Button>
                )}
                {/* <Button>Continue</Button> */}
              </div>
              {error && error?.otp && (
                <span style={{ color: "red" }}>{error?.otp}</span>
              )}
              <br></br>
              <div className="text-center">
                <Button onClick={() => handleOtpClick()} disabled={loader}>
                  Submit{" "}
                  {loader && (
                    <i
                      className="fas fa-spinner fa-spin ml-2"
                      style={{ color: "black" }}
                    ></i>
                  )}
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
      )}

      {walletEmail == true && (
        <Dialog.Root open={emailOpen} onOpenChange={setEmailOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content
              className="DialogContent"
              onPointerDownOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <div className="text-center">
                <Image
                  src={SONOTRADE}
                  alt="Profile Icon"
                  width={200}
                  height={200}
                  className="mx-auto rounded-full"
                />
              </div>
              <br />
              <Dialog.Title className="DialogTitle">Welcome to Sonotrade</Dialog.Title>
              <br />
              <div className="custom_grpinp">
                <input
                  className="Input focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  type="email"
                  name="email"
                  value={email ? email : ""}
                  onChange={registerChange}
                  placeholder="Enter Email"
                />
                <Button onClick={walletEmailClick} disabled={loader}>
                  Continue{" "}
                  {loader && (
                    <i
                      className="fas fa-spinner fa-spin ml-2"
                      style={{ color: "black" }}
                    ></i>
                  )}
                </Button>
              </div>
              {error?.email && (
                <span style={{ color: "red" }}>{error.email}</span>
              )}
              <br />
              <Dialog.Close asChild>
                <button className="modal_close_brn" aria-label="Close">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
      {signedIn ? (
        <>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="rounded p-2 hover:bg-[#333333] relative"
                aria-label="Customise options"
              >
                <BellIcon className="w-6 h-6 " />
                {/* <span className="absolute top-[8px] right-[8px] w-2 h-2 bg-red-500 rounded-full block"></span> */}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <div className="notification_dropdown_portal">
                <DropdownMenu.Content
                  className="notification_menu"
                  sideOffset={5}
                >
                  <DropdownMenu.Label className="text-[18px] font-medium text-gray-100 px-4 py-3 border-b border-gray-700">
                    Notifications
                  </DropdownMenu.Label>
                  {/* <div className="flex flex-col gap-2">
                    <Link
                      href="/notifications"
                      className="flex items-start gap-3 p-4 hover:bg-[#333333] rounded"
                    >
                      <Image
                        src="/images/album.png"
                        alt="Profile Icon"
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div>
                        <h5 className="text-[16px] font-semibold text-gray-100">
                          New market
                        </h5>
                        <p className="text-sm text-gray-300">
                          Will Alex Albon win the 2025 Spanish Grand Prix?
                        </p>
                        <p className="text-[12px] text-gray-400 mb-0">
                          19h ago
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/notifications"
                      className="flex items-start gap-3 p-4 hover:bg-[#333333] rounded"
                    >
                      <Image
                        src="/images/album.png"
                        alt="Profile Icon"
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div>
                        <h5 className="text-[16px] font-semibold text-gray-100">
                          New market
                        </h5>
                        <p className="text-sm text-gray-300">
                          Will Alex Albon win the 2025 Spanish Grand Prix?
                        </p>
                        <p className="text-[12px] text-gray-400 mb-0">
                          19h ago
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/notifications"
                      className="flex items-start gap-3 p-4 hover:bg-[#333333] rounded"
                    >
                      <Image
                        src="/images/album.png"
                        alt="Profile Icon"
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div>
                        <h5 className="text-[16px] font-semibold text-gray-100">
                          New market
                        </h5>
                        <p className="text-sm text-gray-300">
                          Will Alex Albon win the 2025 Spanish Grand Prix?
                        </p>
                        <p className="text-[12px] text-gray-400 mb-0">
                          19h ago
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/notifications"
                      className="flex items-start gap-3 p-4 hover:bg-[#333333] rounded"
                    >
                      <Image
                        src="/images/album.png"
                        alt="Profile Icon"
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div>
                        <h5 className="text-[16px] font-semibold text-gray-100">
                          New market
                        </h5>
                        <p className="text-sm text-gray-300">
                          Will Alex Albon win the 2025 Spanish Grand Prix?
                        </p>
                        <p className="text-[12px] text-gray-400 mb-0">
                          19h ago
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/notifications"
                      className="flex items-start gap-3 p-4 hover:bg-[#333333] rounded"
                    >
                      <Image
                        src="/images/album.png"
                        alt="Profile Icon"
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div>
                        <h5 className="text-[16px] font-semibold text-gray-100">
                          New market
                        </h5>
                        <p className="text-sm text-gray-300">
                          Will Alex Albon win the 2025 Spanish Grand Prix?
                        </p>
                        <p className="text-[12px] text-gray-400 mb-0">
                          19h ago
                        </p>
                      </div>
                    </Link>
                  </div> */}
                  <div className="text-center text-gray-100 text-sm min-h-[200px] flex items-center justify-center">
                    No notifications yet
                  </div>
                </DropdownMenu.Content>
              </div>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="profile_button" aria-label="Customise options">
                {/* <img
                  src={data?.profileImg ? data?.profileImg : "/images/default_user.png"}
                  alt="Profile Icon"
                  width={32}
                  height={32}
                  className="rounded-full"
                /> */}
                <Avatar className="w-6 h-6">
                    {data?.profileImg ? (
                    <AvatarImage
                        src={data?.profileImg}
                        alt={data?.username || "User Avatar"}
                    />
                    ) : (
                    <AvatarFallback className="bg-blue-500 text-sm">
                        {data?.username
                        ? data?.username.charAt(0).toUpperCase()
                        : data?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    )}
                </Avatar>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <div className="custom_dropdown_portal">
                <DropdownMenu.Content className="profile_menu" sideOffset={5}>
                  <div className="flex items-center space-x-3">
                    {/* <img
                      src={data?.profileImg ? data?.profileImg : "/images/default_user.png"}
                      alt="Profile Icon"
                      width={40}
                      height={40}
                      className="rounded-full"
                    /> */}
                    <Avatar className="w-10 h-10">
                    {data?.profileImg ? (
                    <AvatarImage
                        src={data?.profileImg}
                        alt={data?.username || "User Avatar"}
                    />
                    ) : (
                    <AvatarFallback className="bg-blue-500 text-md">
                        {data?.username
                        ? data?.username.charAt(0).toUpperCase()
                        : data?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    )}
                </Avatar>
                    <div>
                      <span className="text-sm text-gray-100">
                        {data?.name ? data?.name : "--"}
                      </span>
                      <div className="text-sm text-gray-100 flex items-center space-x-2">
                        <button className="IconButton bg-[#131212] px-2 py-1 rounded" 
                              // onClick={() => {
                              //   navigator.clipboard.writeText(address ? address : data?.email);
                              //   toastAlert("success", "Address copied to clipboard");
                              // }}
                              >
                                <span className="text-[12px]">
                                  {address ? shortText(address) : data?.email}
                                </span>
                              </button>
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="IconButton bg-[#131212] px-2 py-2 rounded" onClick={() => {
                                navigator.clipboard.writeText(address ? address : data?.email);
                                toastAlert("success", "Address copied to clipboard");
                              }}>
                                <Copy size={14} />
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
                        {/* <Link href="#" target="_blank">
                          <OpenInNewWindowIcon className="h-[16px] w-[16px]" />
                        </Link> */}
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
                  {/* <DropdownMenu.Item className="DropdownMenuItem" disabled>
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
                  </DropdownMenu.Item> */}
                  <DropdownMenu.Item className="DropdownMenuItem" disabled>
                    <Link href="/">Terms of Use</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="DropdownMenuSeparator" />
                  <DropdownMenu.Item className="DropdownMenuItem">
                    <Link href="#" onClick={logout}>Logout</Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </div>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </>
      ) : (
        ""
      )}
    </>
  );
}
