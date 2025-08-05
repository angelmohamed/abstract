"use client";
import Header from "@/app/Header";
import HeaderFixed from "@/app/HeaderFixed";
// import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
// import { navigationItems } from "@/constants";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import config from "../../config/config";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import ChartIntervals from "@/app/components/customComponents/ChartIntervals";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import { Dialog, Accordion, Checkbox, Separator } from "radix-ui";
import { shortText, numberFloatOnly } from "../helper/custommath";
import { toastAlert } from "../../lib/toast";
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
import { userDeposit, addressCheck } from "@/services/wallet";
import { formatNumber } from "../helper/custommath";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor";
import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { reset } from "@/store/slices/auth/userSlice";
import { signOut } from "@/store/slices/auth/sessionSlice";
import OpenOrders from "./OpenOrders";
import Positions from "./Positions";
import History from "./History";
import { Footer } from "../components/customComponents/Footer";
import { setWalletConnect } from "@/store/slices/walletconnect/walletSlice";
import { PnLFormatted } from "@/utils/helpers";
import { parsePriceData } from "@pythnetwork/client";
import { getWalletSettings, getCoinList } from "@/services/user";
import depositIDL from "../../components/IDL/DEPOSITIDL.json";
import Withdraw from "./withdraw";
import { getUserPnL } from "@/services/portfolio";
import { NavigationBar } from "@/app/components/ui/navigation-menu";
import { getCategories } from "@/services/market";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/app/components/ui/tooltip";

let initialValue = {
  currency: "",
  minDeposit: "",
  amount: "",
  walletAddress: "",
};

export default function PortfolioPage({ categories }) {
  const programID = new PublicKey(config?.programID);
  const connection = new Connection(config?.rpcUrl, "confirmed");
  const PYTH_PRICE_ACCOUNT = new PublicKey(config?.PYTH_PRICE_ACCOUNT);

  const { isConnected, address } = useSelector(
    (state) => state?.walletconnect?.walletconnect
  );
  const walletData = useSelector((state) => state?.wallet?.data);
  const data = useSelector((state) => state?.auth?.user);

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
  const [transactionHash, settransactionHash] = useState("");
  const [tokenValue, setTokenValue] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);
  const [coin, setCoin] = useState([]);
  const [walletsetting, setWalletsetting] = useState({});
  const [interval, setInterval] = useState("1m");
  const [copied, setCopied] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectCategory, setSelectedCategory] = useState("all");
  const [navigationItems, setNavigationItems] = useState([]);

  const PRIORITY_FEES = {
    low: 5000,
    medium: 30000,
    high: 75000,
  };

  const router = useRouter();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState({
    username: "",
    avatar_url: "",
    bio: "",
  });
  const [gasAmt, setGasAmt] = useState({ gasCost: 0, marketGasCost: 0 });

  var { currency, amount, walletAddress, minDeposit } = depositData;

  useEffect(() => {
    getPnl();
  }, [walletData, interval]);

  const getPnl = async () => {
    try {
      const { success, result } = await getUserPnL(interval);
      console.log("success,result", success, result);
      if (success) {
        setProfitAmount(result?.totalPnl / 100);
      }
    } catch (err) {
      console.log("error ", err);
    }
  };

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
      if (address) {
        const publicKey = new PublicKey(address);
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
        const formattedBalance = formatNumber(balanceSOL, 4);
        setBalance(formattedBalance);

        const mint = new PublicKey(config?.tokenMint);
        const walletAddress = new PublicKey(address);
        const ata = await getAssociatedTokenAddress(mint, walletAddress);
        if (ata) {
          const tokenAccount = await getAccount(connection, ata);
          if (tokenAccount) {
            const rawBalance = parseFloat(tokenAccount?.amount) / 10 ** 6;
            console.log("✅ Token Balance:", parseFloat(rawBalance));
            const formattedBalance1 = formatNumber(rawBalance, 4);
            setTokenBalance(formattedBalance1);
          }
        }
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
          isConnected: false,
          address: "",
          network: "",
          type: "",
          rpc: "",
          balance: 0,
        })
      );
    }
  }

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
        console.log(balanceSOL, balanceLamports, "balanceSOLbalanceSOL");
        const connectedAddress = response.publicKey.toString();

        const { result } = await addressCheck({ address: connectedAddress });

        if (isEmpty(data?.walletAddress) && result === true) {
          toastAlert(
            "error",
            `This address is already exists. Please connect another new address.`,
            "wallet"
          );
          setOpen(false);
          disconnectWallet();
          return;
        } else if (
          !isEmpty(data?.walletAddress) &&
          connectedAddress?.toLowerCase() !== data?.walletAddress?.toLowerCase()
        ) {
          toastAlert(
            "error",
            `Please connect your wallet address ${data?.walletAddress}`,
            "logout"
          );
          setOpen(false);
          disconnectWallet();
          return;
        }

        dispatch(
          setWalletConnect({
            isConnected: true,
            address: response.publicKey.toString(),
            network: config.network,
            type: config.networkType,
            rpc: config?.rpcUrl,
            balance: balanceSOL,
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
            isConnected: false,
            address: "",
            network: "",
            type: "",
            rpc: "",
            balance: 0,
          })
        );
        toastAlert("error", "Failed to connect wallet", "wallet");
      }
    } else {
      toastAlert("error", "Phantom wallet extension is not installed", "error");
    }
  }

  const getWalletSettingsData = async () => {
    try {
      let respData = await getWalletSettings();
      if (respData.success) {
        setWalletsetting(respData?.result);
      }
    } catch (error) {
      console.error("Error getting wallet settings:", error);
    }
  };

  const getCoinData = async () => {
    try {
      let respData = await getCoinList();
      if (respData.success) {
        setCoin(respData?.result);
      }
    } catch (error) {
      console.error("Error getting coin list:", error);
    }
  };

  useEffect(() => {
    getWalletSettingsData();
    getCoinData();
  }, []);

  const getSolanaTxFee = async () => {
    const publicKey = new PublicKey(address);
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      instructions: [], // no actual instructions
    }).compileToV0Message();

    const feeInLamports = await connection.getFeeForMessage(messageV0);
    let feeInSol = feeInLamports?.value / 1e9;
    if (!isEmpty(walletsetting?.priority)) {
      const microLamports = PRIORITY_FEES[walletsetting?.priority];
      const priorityFeeSol = microLamports / 1e9;
      console.log(priorityFeeSol, "priorityFeeSol");
      feeInSol = feeInSol + priorityFeeSol;
    }
    const feeInUSD = feeInSol * tokenValue;
    setGasAmt({ gasCost: feeInSol, marketGasCost: feeInUSD });

    const accountInfo = await connection.getAccountInfo(PYTH_PRICE_ACCOUNT);
    if (!accountInfo) throw new Error("Pyth price account not found");

    const priceData = parsePriceData(accountInfo.data);
    console.log("📈 SOL/USD price:", priceData.price);

    setTokenValue(priceData.price);
  };

  const getAddress = async (address) => {
    try {
      const { result } = await addressCheck({ address });
      if (isEmpty(data?.walletAddress) && result === true) {
        toastAlert(
          "error",
          `This address is already exists. Please connect another address.`,
          "wallet"
        );
        disconnect();
      } else if (
        (!isEmpty(data?.walletAddress) && result === true) ||
        (!isEmpty(data?.walletAddress) &&
          data?.walletAddress.toString() != address?.toString() &&
          isConnected)
      ) {
        toastAlert(
          "error",
          `Please connect your wallet address ${data?.walletAddress}`,
          "wallet"
        );
        disconnect();
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

  useEffect(() => {
    balanceData();
  }, [address]);

  var step2Click = () => {
    if (!isEmpty(currency)) {
      setStep("2");
      setDepositAmt();
      getSolanaTxFee();
      if (currency == "USDC" && tokenbalance == 0) {
        setStep("1");
        toastAlert("error", "Insufficient Balance", "wallet");
      } else if (currency == "SOL" && balance == 0) {
        setStep("1");
        toastAlert("error", "Insufficient Balance", "wallet");
      } else if (balance <= 0) {
        setStep("1");
        toastAlert("error", "Insufficient SOL Balance", "wallet");
      }
    } else {
      toastAlert("error", "Please select a currency", "wallet");
    }
  };

  var step3Click = () => {
    try {
      var depositBalance = currency == "USDC" ? tokenbalance : balance;
      if (depositBalance > 0) {
        if (isEmpty(depsoitAmt)) {
          toastAlert("error", "Enter the amount", "deposit");
        } else if (depsoitAmt < minDeposit) {
          toastAlert(
            "error",
            `Enter an amount greater than or equal to the minimum deposit amount.`,
            "deposit"
          );
        } else if (depsoitAmt > depositBalance) {
          toastAlert("error", "Insufficient Balance", "deposit");
        } else if (depsoitAmt > 0) {
          setStep("3");
          getSolanaTxFee();
        }
      } else if (depositBalance <= 0) {
        toastAlert("error", "Insufficient Balance", "deposit");
      }
    } catch (err) {
      console.log(err, "ererrrr");
    }
  };

  const balanceChange = (value) => {
    if (currency == "USDC") {
      setDepositAmt(formatNumber(tokenbalance * (value / 100), 4));
    } else {
      setDepositAmt(formatNumber(balance * (value / 100), 4));
    }
  };

  async function disconnect() {
    disconnectWallet();
  }

  const getAnchorProvider = async () => {
    const provider = window.solana;

    if (!provider || !provider.isPhantom) {
      throw new Error("Phantom wallet not found");
    }
    console.log(provider.publicKey, "provider");
    return new AnchorProvider(
      connection,
      {
        publicKey: new PublicKey(address),
        signTransaction: provider.signTransaction,
        signAllTransactions: provider.signAllTransactions,
      },
      { preflightCommitment: "processed" }
    );
  };

  async function buy() {
    try {
      setloader(true);
      if (currency == "USDC") {
        console.log("USDCUSDC");
        const provider = await getAnchorProvider();
        const program = new Program(depositIDL, programID, provider);
        const connection = provider.connection;

        const mint = new PublicKey(config?.tokenMint);
        const receiverPubKey = new PublicKey(config?.adminAdd);

        const fromTokenAccount = await getAssociatedTokenAddress(
          mint,
          provider.publicKey
        );
        const toTokenAccount = await getAssociatedTokenAddress(
          mint,
          receiverPubKey
        );

        console.log(
          fromTokenAccount,
          toTokenAccount,
          provider.publicKey,
          "toTokenAccount"
        );

        // ✅ Check and create receiver ATA if it doesn't exist
        try {
          await getAccount(connection, toTokenAccount);
        } catch (err) {
          console.log(err, "errrr");
          const ataIx = createAssociatedTokenAccountInstruction(
            provider.publicKey, // payer
            toTokenAccount, // ATA to create
            receiverPubKey, // token account owner
            mint // mint address
          );

          const ataTx = new Transaction().add(ataIx);
          ataTx.feePayer = provider.publicKey;

          const blockhash = await connection.getLatestBlockhash();
          ataTx.recentBlockhash = blockhash.blockhash;

          const signedTx = await window.solana.signTransaction(ataTx);
          const ataTxSig = await connection.sendRawTransaction(
            signedTx.serialize()
          );

          // ✅ Use finalized commitment for reliable confirmation
          await connection.confirmTransaction(
            { signature: ataTxSig, ...blockhash },
            "finalized"
          );
        }

        // Optional: small delay to avoid race condition
        await new Promise((res) => setTimeout(res, 500));

        const amount = new BN(parseFloat(depsoitAmt) * 10 ** 6); // adjust decimals if needed

        const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("supported-token"), mint.toBuffer()],
          program.programId
        );

        const [statePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("state")],
          program.programId
        );

        const [userDepositPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), provider.publicKey.toBuffer()],
          program.programId
        );
        let tx = "";
        if (!isEmpty(walletsetting?.priority)) {
          const microLamports = PRIORITY_FEES[walletsetting?.priority];
          const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
            units: 400_000,
          });
          const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports,
          });

          tx = await program.methods
            .transferToken(amount)
            .accounts({
              from: fromTokenAccount,
              to: toTokenAccount,
              authority: provider.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              mint: mint,
              tokenInfo: tokenInfoPDA,
              state: statePDA,
              userDeposit: userDepositPDA,
              systemProgram: web3.SystemProgram.programId,
            })
            .preInstructions([computeUnitLimitIx, priorityFeeIx]) // ✅ Add here
            .rpc({ skipPreflight: false });
        } else {
          tx = await program.methods
            .transferToken(amount)
            .accounts({
              from: fromTokenAccount,
              to: toTokenAccount,
              authority: provider.publicKey,
              tokenProgram: TOKEN_PROGRAM_ID,
              mint: mint,
              tokenInfo: tokenInfoPDA,
              state: statePDA,
              userDeposit: userDepositPDA,
              systemProgram: web3.SystemProgram.programId,
            })
            .rpc({ skipPreflight: false });
          console.log(tx, "dataaaaatxxxx");
        }

        settransactionHash(tx);
        setloader(true);

        const parsedTx = await connection.getParsedTransaction(tx, {
          commitment: "confirmed",
        });

        if (!parsedTx) {
          toastAlert("error", "Transaction not found", "deposit");
          return;
        }

        const { meta, transaction } = parsedTx;

        // Get all token balance changes
        const preTokenBalances = meta?.preTokenBalances || [];
        const postTokenBalances = meta?.postTokenBalances || [];
        let depositdata = {};
        console.log(
          depositdata,
          preTokenBalances,
          postTokenBalances,
          "depositdata"
        );
        // Loop through and compare
        for (let i = 0; i < preTokenBalances.length; i++) {
          const pre = preTokenBalances[i];
          const post = postTokenBalances[i];

          if (!pre || !post) continue;

          const change =
            Number(post.uiTokenAmount.amount) -
            Number(pre.uiTokenAmount.amount);
          if (change !== 0) {
            console.log("✅ SPL Token Transfer Detected:");
            console.log("📤 Owner:", pre.owner);
            console.log("🪙 Mint:", pre.mint);
            console.log(
              "💰 Amount:",
              Math.abs(change) / 10 ** pre.uiTokenAmount.decimals
            );
            const tokenAmt =
              Math.abs(change) / 10 ** pre.uiTokenAmount.decimals;
            depositdata = {
              hash: tx,
              from: pre.owner,
              to: config?.adminAdd.toString(),
              amount: tokenAmt,
              usdAmt: tokenAmt,
              symbol: "USDC",
            };
          }
        }

        var { message, status } = await userDeposit(depositdata, dispatch);
        if (status) {
          toastAlert("success", message, "deposit");
          setDepositAmt(0);
          setStep("");
          setTxOpen(true);
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
          // await getUser();
        } else {
          toastAlert("error", "failed", "deposit");
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
        }
        setloader(false);
      } else if (currency == "SOL") {
        const provider = await getAnchorProvider();
        console.log(provider.publicKey.toBase58(), "toTokenAccount");
        const program = new Program(depositIDL, programID, provider);
        const lamports = new BN(parseFloat(depsoitAmt) * web3.LAMPORTS_PER_SOL);
        const receiverPubKey = new PublicKey(config?.adminAdd);

        // Derive PDAs
        const [statePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("state")],
          program.programId
        );

        const [userDepositPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), provider.publicKey.toBuffer()],
          program.programId
        );
        let tx = "";
        if (!isEmpty(walletsetting?.priority)) {
          const microLamports = PRIORITY_FEES[walletsetting?.priority]; // 0.00002 SOL tip
          const computeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
            units: 400_000,
          });
          const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports,
          });

          // ✅ Call the transferSol method
          tx = await program.methods
            .transferSol(lamports)
            .accounts({
              sender: provider.publicKey,
              receiver: receiverPubKey,
              systemProgram: web3.SystemProgram.programId,
              state: statePDA,
              userDeposit: userDepositPDA,
              pythPriceAccount: PYTH_PRICE_ACCOUNT,
            })
            .preInstructions([computeUnitLimitIx, priorityFeeIx]) // ✅ Add here
            .rpc({ skipPreflight: false });
        } else {
          console.log(walletsetting?.priority, "priority");
          tx = await program.methods
            .transferSol(lamports)
            .accounts({
              sender: provider.publicKey,
              receiver: receiverPubKey,
              systemProgram: web3.SystemProgram.programId,
              state: statePDA,
              userDeposit: userDepositPDA,
              pythPriceAccount: PYTH_PRICE_ACCOUNT,
            })
            .rpc({ skipPreflight: false });
        }
        console.log(tx, "tx");

        settransactionHash(tx);
        setloader(true);

        const txDetails = await connection.getTransaction(tx, {
          commitment: "confirmed",
        });

        if (!txDetails) {
          console.error("❌ Transaction not found");
          return;
        }

        const { meta, transaction } = txDetails;
        const accountKeys = transaction.message.accountKeys;

        // 🔍 Find sender and receiver indices
        const senderIndex = accountKeys.findIndex((key) =>
          key.equals(provider.publicKey)
        );
        const receiverIndex = accountKeys.findIndex((key) =>
          key.equals(receiverPubKey)
        );

        if (senderIndex === -1 || receiverIndex === -1) {
          console.error("❌ Could not find sender or receiver in account keys");
          return;
        }

        // 🧮 Calculate lamports sent
        const lamportsSentTotal =
          meta.preBalances[senderIndex] - meta.postBalances[senderIndex];
        const feePaid = meta.fee;
        const lamportsSent = lamportsSentTotal - feePaid;

        const solAmt = lamports / LAMPORTS_PER_SOL;
        const usdValue = formatNumber(solAmt * tokenValue, 6);

        console.log("TX Hash:", tx);
        console.log("From:", provider.publicKey.toBase58());
        console.log("To:", receiverPubKey.toBase58());
        console.log("Amount (lamports):", lamportsSent);
        console.log("Amount (SOL):", solAmt);
        console.log("USD Value ($):", usdValue);
        console.log("Fee (lamports):", feePaid);
        console.log("Fee (SOL):", feePaid / LAMPORTS_PER_SOL);

        let depositdata = {
          hash: tx,
          from: provider.publicKey.toBase58(),
          to: receiverPubKey.toBase58(),
          amount: solAmt,
          usdAmt: usdValue,
          symbol: "SOL",
        };
        var { message, status } = await userDeposit(depositdata, dispatch);
        if (status) {
          toastAlert("success", message, "deposit");
          setDepositAmt(0);
          setStep("");
          setTxOpen(true);
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
          // await getUser();
        } else {
          toastAlert("error", message, "deposit");
          const button = document.querySelector(".modal_close_brn");
          if (button) {
            button.click();
          }
        }
        setloader(false);
      }
    } catch (err) {
      console.log(err, "errr");
      setloader(false);
      const button = document.querySelector(".modal_close_brn");
      if (button) {
        button.click();
      }
    }
  }

  const handlechange = async (e) => {
    let value = e.target.value;
    setDepositAmt(parseFloat(e.target.value));
    // let isNum = numberFloatOnly(value);
    // if (isNum) {
    //   setshowallowance(false);
    //   if (value > allowance && currency == "USDC") {
    //     setshowallowance(true);
    //   }
    // }
  };

  const iniDepsotClick = () => {
    if (isConnected == true) {
      setStep("1");
      setDepositAmt(0);
      balanceData();
      getSolanaTxFee();
      setTxOpen(false);
      getCoinData();
      setloader(false);
    } else if (
      !isEmpty(data?.walletAddress) &&
      data?.walletAddress.toString() != address?.toString() &&
      isConnected
    ) {
      toastAlert(
        "error",
        `Please connect your wallet address ${data?.walletAddress}`,
        "wallet"
      );
    } else {
      toastAlert("error", "Connect Your Wallet", "deposit");
    }
  };

  return (
    <>
      <div className="text-white bg-black h-auto items-center justify-items-center p-0 m-0">
<<<<<<< HEAD
        <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md bg-black/90 border-b border-[#222] lg:mb-4 mb-0" style={{ borderBottomWidth: '1px' }}>
=======
        <div className="sticky top-0 z-50 w-[100%] bg-black lg:bg-transparent backdrop-blur-0 lg:backdrop-blur-md border-b border-[#222] lg:mb-4 mb-0" style={{ borderBottomWidth: '1px' }}>
>>>>>>> 10f44ce3b85a8a637c93d48ba756c4481e7b481c
          <Header />
          <NavigationBar
            menuItems={categories}
            showLiveTag={true}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectCategory}
          />
        </div>
        <div className="container mx-auto px-4 container-sm">
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
            <div
              className="flex-1 bg-black rounded-lg p-4 border relative"
              style={{ boxShadow: "0 2px 6px 0 rgba(220,220,255,0.13)" }}
            >
              <div className="absolute top-4 right-4 bg-[#051505] text-green-400 text-xs px-2 py-1 rounded-md border border-green-400 flex items-center">
                <Image
                  src="/images/cash.png"
                  alt="cash"
                  width={16}
                  height={16}
                  className="mr-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer">
                        {walletData?.balance
                          ? PnLFormatted(
                              formatNumber(
                                walletData?.balance - walletData?.locked,
                                2
                              )
                            )
                          : 0}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={8}
                      className="text-xs"
                    >
                      Available Balance
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex flex-col items-left">
                  <span className="text-sm text-gray-500 mt-1">PORTFOLIO</span>
                  <span className="mt-2 text-3xl font-semibold">
                    {walletData?.balance
                      ? // ? PnLFormatted(formatNumber(walletData?.balance - walletData?.locked, 2))
                        PnLFormatted(
                          formatNumber(
                            walletData?.balance + walletData?.position,
                            2
                          )
                        )
                      : 0}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    <span className="text-green-500">$0.00 (0.00%)</span> Today
                  </span>
                </div>
                {/* <Badge className="z-10 text-sm text-white bg-[#00c735] font-normal">
                  {walletData?.balance
                    ? 
                      PnLFormatted(
                        formatNumber(
                          walletData?.balance - walletData?.locked,
                          2
                        )
                      )
                    : 0}
                </Badge> */}
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
                        className="w-full flex-1 h-10 px-4 py-2 rounded-md border border-white bg-white text-black hover:bg-gray-300 hover:border-gray-300 transition-colors duration-300 text-sm font-medium flex items-center justify-center"
                      >
                        <span className="mr-2 text-lg">+</span>
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
                              Available Balance:{" "}
                              {currency === "USDC"
                                ? `${tokenbalance} ${currency}`
                                : `${balance} ${currency ? currency : "SOL"}`}
                              {/* {formatNumber(balance * usdConvt, 4)} */}
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
                                    src="/images/wallet_icon_02.png"
                                    alt="Profile Icon"
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                  />
                                  <span
                                    className="text-[14px] text-gray-200"
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(
                                        address
                                      );
                                      setCopied(true);
                                      setTimeout(() => setCopied(false), 1000);
                                    }}
                                  >
                                    Wallet {shortText(address)}
                                    {copied && (
                                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-black px-2 py-0.5 rounded shadow">
                                        Copied!
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[13px] text-gray-400">
                                    {/* $10.20 */}
                                    {balance} SOL
                                  </span>
                                </div>
                              </Button>
                              {coin &&
                                coin.length > 0 &&
                                coin.map((value, i) => {
                                  const isSelected =
                                    depositData.currency === value?.symbol;
                                  const tokenIcon =
                                    value?.symbol === "USDC"
                                      ? "/images/usdc.svg"
                                      : "/images/solana.png";
                                  const tokenAmount =
                                    value?.symbol === "USDC"
                                      ? tokenbalance
                                      : balance;
                                  const tokenValueUSD =
                                    value?.symbol === "USDC"
                                      ? tokenbalance
                                      : formatNumber(balance * tokenValue, 4);

                                  return (
                                    <div key={i} className="wallet_coin_list">
                                      <div
                                        className={`flex items-center justify-between my-3 border px-3 py-1 rounded cursor-pointer transition ${
                                          isSelected
                                            ? "border-[#4f99ff] bg-[#1a1a1a]"
                                            : "border-[#3d3d3d] hover:bg-[#1e1e1e]"
                                        }`}
                                        onClick={() =>
                                          setDepositData((prev) => ({
                                            ...prev,
                                            currency: value?.symbol,
                                            minDeposit: value?.minDeposit,
                                          }))
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <Image
                                            src={
                                              isEmpty(value?.image)
                                                ? tokenIcon
                                                : value?.image
                                            }
                                            alt={`${value?.symbol} Icon`}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                          />
                                          <div className="flex flex-col">
                                            <span className="text-[14px]">
                                              {value?.symbol}
                                            </span>
                                            <span className="text-[12px] text-gray-400">
                                              {tokenAmount} {value?.symbol}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-[14px]">
                                          ${tokenValueUSD}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
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
                                className="wallet_inp focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
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
                                {`${minDeposit} ${currency} minimum deposit`}
                                {/* `${minDeposit} ${currency} minimum deposit`} */}
                              </p>
                              <div
                                className="flex gap-3 items-center justify-between sm:flex-nowrap flex-wrap py-3 px-4 border border-[#3d3d3d] rounded-full sm:w-[60%] w-[100%] m-auto mt-3
                          "
                              >
                                <div className="flex items-center gap-2">
                                  <Image
                                    src={
                                      currency == "USDC"
                                        ? "/images/usdc.svg"
                                        : "/images/solana.png"
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
                                    const button =
                                      document.querySelector(
                                        ".modal_close_brn"
                                      );
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
                                    src="/images/wallet_icon_02.png"
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
                                      currency == "USDC"
                                        ? "/images/usdc.svg"
                                        : "/images/solana.png"
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
                                    {currency == "USDC"
                                      ? `${depsoitAmt} USDC`
                                      : `${formatNumber(
                                          depsoitAmt * tokenValue,
                                          4
                                        )} USDC`}
                                    {/* tokenAmt */}
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
                                          {gasAmt?.gasCost
                                            ? formatNumber(gasAmt?.gasCost, 6)
                                            : 0}{" "}
                                          SOL
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
                                        {gasAmt?.gasCost
                                          ? formatNumber(gasAmt?.gasCost, 6)
                                          : 0}{" "}
                                        SOL
                                      </span>
                                    </div>

                                    <div className="flex gap-2 items-center justify-between py-1">
                                      <span className="text-[13px] text-gray-400">
                                        Market gas price
                                      </span>
                                      <span className="text-[13px] text-gray-200">
                                        $ {""}
                                        {gasAmt?.marketGasCost
                                          ? formatNumber(
                                              gasAmt?.marketGasCost,
                                              6
                                            )
                                          : 0}{" "}
                                        {/* Gwei */}
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
                              {/* {showallowance ? (
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
                              ) : ( */}
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
                              {/* )} */}
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
                          You will receive: <strong>{currency == "USDC" ? `${depsoitAmt} USDC` : `${tokenAmt} USDC`}</strong>
                        </div> */}

                        {transactionHash && (
                          <a
                            className="text-blue-500 hover:underline mt-4 flex items-center gap-2"
                            href={`${config?.txUrl}${transactionHash}?cluster=${config?.networkType}`}
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

                <Withdraw />
              </div>
            </div>
            <div
              className="flex-1 bg-black rounded-lg p-4 flex flex-col justify-between border relative"
              style={{ boxShadow: "0 2px 6px 0 rgba(220,220,255,0.13)" }}
            >
              <div className="flex items-start justify-between flex-wrap">
                <div className="flex flex-col items-left">
                  <span className="text-sm text-gray-500 mt-1">
                    PROFIT/LOSS
                  </span>
                  <span
                    className={`mt-2 text-3xl font-semibold ${
                      profitAmount >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {PnLFormatted(formatNumber(profitAmount, 2))}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    <span
                      className={`${
                        profitAmount >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      $0.00 (0.00%)
                    </span>{" "}
                    Today
                  </span>
                </div>
                <div className="justify-center items-center">
                  <ChartIntervals
                    interval={interval}
                    setInterval={setInterval}
                    isAllDisable={true}
                  />
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
            <div className="flex justify-between items-center">
              <TabsList className="flex space-x-4 w-full justify-start">
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
                              <Badge className="z-10 text-xs text-[#7dfdfe] bg-[#152632] font-normal">
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
                          <Button className="bg-[#ec4899] text-[#fff] hover:text-[#000] w-[80px]">
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
                              <Badge className="z-10 text-xs text-[#7dfdfe] bg-[#152632] font-normal">
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
                                      <p className="font-semibold text-[#7dfdfe] mb-0 text-[24px]">
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
                                    <Badge className="z-10 text-[16px] text-[#7dfdfe] bg-[#152632] font-normal rounded">
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
                                      <p className="text-[#7dfdfe] mb-0 font-semibold">
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
              <Positions />
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
              <OpenOrders />
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
                        <Badge className="z-10 text-xs text-[#7dfdfe] bg-[#152632] font-normal">
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
                        <Badge className="z-10 text-xs text-[#ec4899] bg-[#321b29] font-normal">
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
              <History />
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
      <HeaderFixed />
    </>
  );
}
