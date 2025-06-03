import React, { memo, useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

import { toastAlert } from "@/lib/toast";

import { placeOrder } from "@/services/market";

import { useSelector } from "@/store";

interface LimitOrderProps {
    activeView: string,
    marketId: string,
    buyorsell: "buy" | "sell",
}

interface FormState {
    price: string | number;
    amount: string | number;
}

interface ErrorState {
    price?: string;
    amount?: string;
}

const initialFormValue = {
    price: "",
    amount: "",
}

const errorState = {
    price: "",
    amount: "",
}

const LimitOrder: React.FC<LimitOrderProps> = (props) => {
    const { activeView, marketId, buyorsell } = props;

    const { signedIn } = useSelector((state) => state?.auth.session);
    const user = useSelector((state) => state?.auth.user);
    const asset = useSelector((state) => state?.wallet?.data);

    // state
    const [formValue, setFormValue] = useState<FormState>(initialFormValue);
    const [errors, setErrors] = useState<ErrorState>(errorState);
    const { price, amount } = formValue;

    // function
    const handleChangeBtn = (op: "+" | "-", key: string) => {
        if (op === "+") {
            setFormValue((prev) => ({ ...prev, [key]: Number(prev[key]) + 1 }));
        } else if (op === "-") {
            setFormValue((prev) => {
                if (Number(prev[key]) - 1 > 0) {
                    return { ...prev, [key]: Number(prev[key]) - 1 };
                } else {
                    return { ...prev, [key]: 0 };
                }
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValue((prev: any) => {
            if (+value < 100) {
                return { ...prev, [name]: value };
            } else if (+value < 0) {
                return { ...prev, [name]: 0 };
            }
            return prev;
        });
    };

    const handlePlaceOrder = async (action) => {
        // if (orderType === "limit" && !limitOrderValidation()) {
        //     console.log("Validation failed", errors);
        //     return;
        // }
        let activeTab = activeView?.toLowerCase();
        let data = {
            price: action === "sell" ? 100 - Number(price) : price,
            side: action === "buy" ? activeTab : activeTab === "yes" ? "no" : "yes",
            userSide: activeTab,
            action: action,
            capped: action === "sell" ? true : false,
            marketId,
            userId: user?._id,
            quantity: amount,
            type: "limit",
        };
        const { success, message } = await placeOrder(data);
        if (success) {
            toastAlert("success", "Order placed successfully!", "order-success");
            setFormValue({ ...formValue, price: 0, amount: 0 });
        } else {
            toastAlert("error", message, "order-failed");
        }
        // console.log("Placing order with data: ", market._id);
    };

    return (
        <>
            <div className="flex justify-between mt-3">
                <div className="flex flex-col">
                    <span className="text-[#fff] text-[16px]">
                        Limit Price
                    </span>
                    <p className="text-muted-foreground text-sm">
                        Balance ${asset?.balance}
                    </p>
                </div>
                <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                    <span
                        className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                        onClick={() => handleChangeBtn("-", "price")}
                    >
                        -
                    </span>
                    <Input
                        type="text"
                        value={price}
                        name="price"
                        placeholder="0 ¢"
                        onChange={handleChange}
                        className="border-0 w-[100px] text-center bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span
                        className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                        onClick={() => handleChangeBtn("+", "price")}
                    >
                        +
                    </span>
                </div>
            </div>
            <span className="text-red-500">{errors?.price}</span>

            <div className="flex justify-between mt-3">
                <div className="flex flex-col">
                    <span className="text-[#fff] text-[16px]">
                        Shares
                    </span>
                    <p className="text-muted-foreground text-sm cursor-pointer">
                        Max
                    </p>
                </div>
                <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                    <Input
                        type="text"
                        name="amount"
                        placeholder="0"
                        value={amount}
                        onChange={handleChange}
                        className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
            </div>
            <span className="text-red-500">{errors?.amount}</span>
            <div className="flex gap-2 pt-2 justify-end">
                <Button
                    className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                    onClick={() => handleChangeBtn("-", "amount")}
                >
                    -$10
                </Button>
                <Button
                    className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                    onClick={() => handleChangeBtn("+", "amount")}
                >
                    +$10
                </Button>
            </div>

            {/* <div className="flex items-center justify-between mt-3">
                          <label
                            className="Label"
                            htmlFor="expiry"
                            style={{ paddingRight: 15 }}
                          >
                            Set Expiration
                          </label>
                          <Switch.Root className="SwitchRoot" id="expiry">
                            <Switch.Thumb className="SwitchThumb" />
                          </Switch.Root>
                        </div>

                        <select
                          className="border bg-[#131212] border-[#262626] bg-black rounded w-full p-3 mt-2 text-[14px]"
                          onChange={(e) => {
                            if (e.target.value === "Custom") {
                              setShowCustomDialog(true);
                            }
                          }}
                        >
                          <option>End of Day</option>
                          <option>Custom</option>
                        </select> */}

            {/* {customDate && (
                <div className="text-sm text-[#fff] mt-2">
                    {daysLeft !== null &&
                        `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"
                        }`}
                </div>
            )} */}

            <div className="pt-1 pb-1 mt-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground">
                        {/* You can add logic for limit order shares */}
                        {amount}
                    </span>
                </div>
            </div>

            <div className="pt-1 pb-1">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        To Win
                    </span>
                    <span className="text-foreground">
                        {/* You can add logic for limit order shares */}
                        ${Number(amount)/100}
                    </span>
                </div>
            </div>
            <div className="pt-4">
                {signedIn ? (
                    <Button
                        className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                        onClick={() => handlePlaceOrder("buy")}
                    >
                        {`${buyorsell === "buy" ? "Buy" : "Sell"} ${activeView}`}
                    </Button>
                ) : (
                    <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                        Login
                    </Button>
                )}
            </div>
        </>
    );
}
export default memo(LimitOrder);