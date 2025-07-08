"use client";
import Header from "@/app/Header";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import config from "../../config/config";
import { Dialog, Accordion, Checkbox, Separator } from "radix-ui";
import { shortText, numberFloatOnly, numberOnly } from "../helper/custommath";
import { formatNumber } from "../helper/custommath";
import { toastAlert } from "../../lib/toast"
import { useDispatch } from "react-redux";
import { useSelector } from "@/store";
import isEmpty from "is-empty";
import {
    Cross2Icon,
    InfoCircledIcon,
    CheckIcon,
    CopyIcon,
} from "@radix-ui/react-icons";
import { PnLFormatted } from "@/utils/helpers";
import { Input } from "../components/ui/input";
import { withdrawValidate, withdrawInputValidate } from "../validation/validation"
import { withdrawRequest } from "@/services/wallet";
import { getCoinList } from "@/services/user";



let initialValue = {
    amount: "",
    userAddress: "",
};

export default function Withdraw() {
    const dispatch = useDispatch()
    const walletData = useSelector(state => state?.wallet?.data);
    const { isConnected, address } = useSelector((state) => state?.walletconnect?.walletconnect);

    const [withdraw, setWithdraw] = useState(initialValue);
    const [error, setError] = useState({})
    const [loader, setLoader] = useState(false)
    const [open, setOpen] = useState(false)
    const [coin, setCoin] = useState({})
    // const minWithdraw = 0.01
    const availableBalance = walletData?.balance
        ? formatNumber(walletData?.balance - walletData?.locked + walletData?.position, 2)
        : 0

    let { amount, userAddress } = withdraw

    const handleChange = async (e) => {
        const { name, value } = e.target
        delete error[name];
        const resetData = { ...withdraw, ...{ [name]: value } }
        setWithdraw(resetData)
        let errMsg = withdrawInputValidate(resetData, name);
        setError({ ...error, ...errMsg });
    }


    function amtValidate(amount) {
        var isError = false;
        var errMsg = "";
        if (isEmpty(amount)) {
            isError = true;
            errMsg = "Please enter the amount";
        } else if (parseFloat(availableBalance) <= 0) {
            isError = true;
            errMsg = "Insufficient Balance";
        }
        else if (parseFloat(amount) < coin?.minWithdraw || amount == 0 || amount == "0") {
            isError = true;
            errMsg = `Minimum withdrawal amount is ${coin?.minWithdraw}.`
        } else if (parseFloat(amount) > parseFloat(availableBalance)) {
            isError = true;
            errMsg = "Insufficient Balance";
        }
        return {
            isError,
            errMsg
        }
    }

    let handleClick = async () => {
        try {
            let errMsg = await withdrawValidate(withdraw);
            setError(errMsg);
            if (isEmpty(errMsg)) {
                let { isError, errMsg } = amtValidate(amount);
                if (isError) {
                    toastAlert("error", errMsg, "withdraw");
                    return;
                }
                setLoader(true)
                withdraw.from = config?.adminAdd
                withdraw.fee = coin?.withdrawFee
                const feeAmt = (coin?.withdrawFee / 100) * amount;
                withdraw.withdrawAmt = amount - feeAmt
                withdraw.minWithdraw = coin?.minWithdraw
                console.log(withdraw, coin, feeAmt, "withdrawaaaa");
                let { success, message } = await withdrawRequest(withdraw, dispatch);
                if (success) {
                    setLoader(false)
                    setWithdraw(initialValue)
                    setError({})
                    setOpen(false)
                    toastAlert("success", message, "withdraw");
                } else {
                    toastAlert("error", message, "withdraw");
                    setLoader(false)
                }
            }
        } catch (err) {
            console.log(err, "errr");
        }
    };


    const getCoinData = async () => {
        try {
            const respData = await getCoinList();
            if (respData.success) {
                const usdcCoin = respData.result.find((coin) => coin.symbol === "USDC");
                if (usdcCoin) {
                    setCoin(usdcCoin);
                } else {
                    console.warn("USDC coin not found.");
                }
            }
        } catch (error) {
            console.error("Error getting coin list:", error);
        }
    };


    useEffect(() => {
        getCoinData()
    }, []);
    console.log(withdraw, coin, "withdraw");
    return (
        <div
            className="text-[12px]"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "48%",
            }}
        >
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <Button className="w-full mb-1 bg-[#321b29] text-[#ec4899] hover:bg-[#ec4899] hover:text-[#000000] transition-colors duration-300 rounded-full"
                        onClick={async () => {
                            setWithdraw(initialValue)
                            setError({})
                            setOpen(true)
                            setLoader(false)
                            await getCoinData()
                        }}>
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
                                Only send to a USDC address on the Solana network.
                            </span>
                        </div>
                        <form className="mt-4">
                            <fieldset className="Fieldset mb-4">
                                <div className="flex gap-2 items-center justify-between mb-1">
                                    <label className="Label" htmlFor="Address">
                                        Address
                                    </label>
                                    <span className="text-[14px] text-gray-400 cursor-pointer underline underline-offset-4"
                                        onClick={() => {
                                            setWithdraw({ ...withdraw, ...{ userAddress: address ? address : "" } })
                                            if (!isEmpty(address)) {
                                                setError({ ...error, ...{ userAddress: "" } })
                                            }
                                        }}>
                                        Use connected
                                    </span>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    className="Input h-12 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                    id="userAddress"
                                    name="userAddress"
                                    onChange={handleChange}
                                    value={userAddress}
                                />
                                {error?.userAddress && (
                                    <span style={{ color: "red" }}>{error.userAddress}</span>
                                )}
                            </fieldset>

                            <fieldset className="Fieldset mt-4">
                                <div className="flex gap-2 items-center justify-between mb-1">
                                    <label className="Label" htmlFor="Amount">
                                        Amount{" "}
                                        <span className="text-[14px] text-gray-400">
                                            (${coin?.minWithdraw} min) ({coin?.withdrawFee}% Fee)
                                        </span>
                                    </label>
                                    <div className="flex gap-2">
                                        <span className="text-[14px] text-gray-400 cursor-pointer">
                                            {PnLFormatted(availableBalance)} available
                                        </span>
                                        <span className="text-[14px] text-gray-400 cursor-pointer underline underline-offset-4"
                                            onClick={() => {
                                                setWithdraw({ ...withdraw, ...{ amount: availableBalance ? availableBalance : "" } })
                                                if (!isEmpty(availableBalance)) {
                                                    setError({ ...error, ...{ amount: "" } })
                                                }
                                            }}>
                                            Max
                                        </span>
                                    </div>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="$0.00"
                                    className="Input h-12 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                    id="amount"
                                    name="amount"
                                    onChange={handleChange}
                                    value={numberFloatOnly(amount) || numberOnly(amount) ? amount : ""}
                                />
                                {error?.amount && (
                                    <span style={{ color: "red" }}>{error.amount}</span>
                                )}
                                {
                                    !isEmpty(amount) && (() => {
                                        const feeAmt = (coin?.withdrawFee / 100) * amount;
                                        const withdrawAmt = amount - feeAmt;
                                        return (
                                            <span className="text-[14px] text-gray-400 cursor-pointer">
                                                Withdrawal Amount: {formatNumber(withdrawAmt, 4)} USDC
                                            </span>
                                        );
                                    })()
                                }

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

                            <Button type="button" className="mt-4 w-full" onClick={handleClick}>Withdraw
                                {loader && (
                                    <i
                                        className="fas fa-spinner fa-spin ml-2"
                                        style={{ color: "black" }}
                                    ></i>
                                )}</Button>
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
    );
}
