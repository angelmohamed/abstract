import React, { memo, useEffect, useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

import { toastAlert } from "@/lib/toast";

import { placeOrder } from "@/services/market";

import { useSelector } from "@/store";
import { availableBalance } from "@/lib/utils";
import { Switch } from "radix-ui";
import CustomDateComponent from "./CustomDate";
import { isEmpty } from "@/lib/isEmpty";
import { firstLetterCase } from "@/lib/stringCase";

interface LimitOrderProps {
  activeView: string;
  marketId: string;
  buyorsell: "buy" | "sell";
  selectedOrder: any;
  outcomes: any;
  makerFee: any;
  takerFee: any;
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
};

const errorState = {
  price: "",
  amount: "",
};

const LimitOrder: React.FC<LimitOrderProps> = (props) => {
  const {
    activeView,
    marketId,
    buyorsell,
    selectedOrder,
    outcomes,
    makerFee,
    takerFee,
  } = props;

  const { signedIn } = useSelector((state) => state?.auth.session);
  const user = useSelector((state) => state?.auth.user);
  const asset = useSelector((state) => state?.wallet?.data);

  // state
  const [formValue, setFormValue] = useState<FormState>(initialFormValue);
  const [errors, setErrors] = useState<ErrorState>(errorState);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(false);
  const [customDate, setCustomDate] = useState<any>("");
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [userPosition, setUserPosition] = useState<number>(0);
  const [expirationSeconds, setExpirationSeconds] = useState<number | null>(
    null
  );

  const { price, amount } = formValue;

  // function
  const handleChangeBtn = (op: "+" | "-", key: string, increment: number) => {
    if (op === "+") {
      setFormValue((prev) => {
        let maxNum = {
          price: 100,
          amount: 100001,
        };
        console.log("maxNum[key]", maxNum[key]);
        if (Number(prev[key]) + increment >= maxNum[key]) {
          return { ...prev, [key]: maxNum[key] - 1 };
        } else {
          return { ...prev, [key]: Number(prev[key]) + increment };
        }
      });
    } else if (op === "-") {
      setFormValue((prev) => {
        if (Number(prev[key]) - increment > 0) {
          return { ...prev, [key]: Number(prev[key]) - increment };
        } else {
          return { ...prev, [key]: 0 };
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormValue((prev: any) => {
      if (name === "price") {
        const numericValue = value.replace(/[^0-9]/g, "");
        const priceNum = parseInt(numericValue);

        if (numericValue === "") {
          return { ...prev, [name]: "" };
        } else if (priceNum >= 1 && priceNum <= 99) {
          return { ...prev, [name]: numericValue };
        } else {
          return prev;
        }
      } else if (name === "amount") {
        // const numericValue = value.replace(/[^0-9.]/g, '');

        // const parts = numericValue.split('.');
        // if (parts.length > 2) {
        //   return prev;
        // }

        // if (parts[1] && parts[1].length > 2) {
        //   return prev;
        // }

        // const amountNum = parseInt(numericValue);

        // if (numericValue === '' || numericValue === '.') {
        //   return { ...prev, [name]: numericValue };
        // } else if (amountNum >= 0 && amountNum <= 100000) {
        //   return { ...prev, [name]: numericValue };
        // } else {
        //   return prev;
        // }

        const numericValue = value.replace(/[^0-9]/g, ""); // Only digits, no decimal point

        if (numericValue === "") {
          return { ...prev, [name]: "" };
        }

        const amountNum = parseInt(numericValue, 10);

        if (!isNaN(amountNum) && amountNum >= 0 && amountNum <= 100000) {
          return { ...prev, [name]: numericValue };
        }

        return prev;
      } else {
        return prev;
      }
    });
  };

  const limitOrderValidation = () => {
    let errors: any = {};
    if (!price) {
      errors.price = "Amount field is required";
    }
    if (Number(price) <= 0) {
      errors.price = "Amount must be greater than 0";
    } else if (Number(price) >= 100) {
      errors.price = "Amount must be less than 99";
    }
    if (!amount) {
      errors.amount = "Contracts field is required";
    }
    if (Number(amount) <= 0) {
      errors.amount = "Contracts must be greater than 0";
    }
    // if (customDate && customDate <= new Date()) {
    //   errors.customDate = "Custom date must be in the future";
    // }
    setErrors(errors);
    return Object.keys(errors).length > 0 ? false : true;
  };

  const handlePlaceOrder = async (action: any) => {
    let activeTab = activeView?.toLowerCase();
    if (!limitOrderValidation()) {
      return;
    }
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
      timeInForce: isExpirationEnabled ? "GTD" : "GTC",
    };
    if (isExpirationEnabled) {
      data["expiration"] = expirationSeconds;
    }
    const { success, message } = await placeOrder(data);
    if (success) {
      toastAlert("success", "Order placed successfully!", "order-success");
      setFormValue({ ...formValue, price: "", amount: "" });
    } else {
      toastAlert("error", message, "order-failed");
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (userPosition <= 0) {
      toastAlert("error", "You don't have any Contracts to sell", "no-position");
      return;
    }

    let amount = 0;
    if (percentage === 100) {
      amount = userPosition;
    } else {
      amount = Math.floor((userPosition * percentage) / 100);
    }

    setFormValue((prev) => ({
      ...prev,
      amount,
    }));
  };

  useEffect(() => {
    const now = new Date();
    if (customDate) {
      const diff = Number(customDate) - Number(now);
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? days : 0);
      const seconds = Math.floor(diff / 1000);
      setExpirationSeconds(seconds);
    } else {
      setDaysLeft(null);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const seconds = Math.floor((endOfDay.getTime() - Number(now)) / 1000);
      setExpirationSeconds(seconds);
    }
  }, [customDate]);

  useEffect(() => {
    setFormValue(initialFormValue);
    setErrors({});
  }, [activeView, buyorsell, marketId]);

  useEffect(() => {
    if (isEmpty(selectedOrder)) {
      return;
    }

    if (buyorsell == "buy" && selectedOrder?.bidOrAsk == "ask") {
      setFormValue({
        price: selectedOrder?.row[0],
        amount: selectedOrder?.row[1],
      });
    } else if (buyorsell == "sell" && selectedOrder?.bidOrAsk == "bid") {
      setFormValue({
        price: selectedOrder?.row[0],
        amount: selectedOrder?.row[1],
      });
    } else {
      setFormValue({
        price: selectedOrder?.row[0],
        amount: "",
      });
    }
  }, [selectedOrder]);

  return (
    <>
      <div className="flex justify-between mt-3">
        <div className="w-full flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
          <Input
            type="text"
            name="amount"
            placeholder="Amount"
            value={amount}
            onChange={handleChange}
            className="border-0 text-left bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
          <span className="cursor-default text-[16px] p-3">Contracts</span>
        </div>
      </div>
      <span className="text-red-500 text-sm">{errors?.amount}</span>

      <div className="flex justify-between mt-3">
        <div className="w-full flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
          <Input
            type="text"
            value={price}
            name="price"
            placeholder="Limit Price"
            onChange={handleChange}
            className="border-0 text-left bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
          <span className="cursor-default text-[16px] p-3">¢</span>
        </div>
      </div>
      <span className="text-red-500 text-sm">{errors?.price}</span>

      {/* {buyorsell == "sell" ? (
        <div className="flex gap-2 pt-2 justify-end">
          <Button
            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handlePercentageClick(25)}
          >
            25%
          </Button>
          <Button
            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handlePercentageClick(50)}
          >
            50%
          </Button>
          <Button
            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handlePercentageClick(100)}
          >
            Max
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 pt-2 justify-end">
          <Button
            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("-", "amount", 10)}
          >
            -10
          </Button>
          <Button
            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", "amount", 10)}
          >
            +10
          </Button>
        </div>
      )} */}

      <div className="flex items-center justify-between mt-3">
        <label className="Label" htmlFor="expiry" style={{ paddingRight: 15 }}>
          Set Expiration
        </label>
        <Switch.Root
          className="SwitchRoot"
          id="expiry"
          checked={isExpirationEnabled}
          onCheckedChange={(checked) => {
            setIsExpirationEnabled(checked);
            if (!checked) {
              setCustomDate("");
              setDaysLeft(null);
            }
          }}
        >
          <Switch.Thumb className="SwitchThumb" />
        </Switch.Root>
      </div>

      {isExpirationEnabled && (
        <select
          className="border bg-[#131212] border-[#262626] rounded w-full p-3 mt-2 text-[14px]"
          onChange={(e) => {
            if (e.target.value === "Custom") {
              setShowCustomDialog(true);
            } else {
              setCustomDate("");
              setDaysLeft(null);
            }
          }}
        >
          <option>End of Day</option>
          <option>Custom</option>
        </select>
      )}

      {customDate && (
        <div className="text-sm text-[#fff] mt-2">
          {daysLeft !== null &&
            `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
        </div>
      )}

      {buyorsell == "buy" ? (
        <>
          <div className="pt-2 space-y-2 pb-2">
            <div className="flex justify-between text-sm pt-2">
              <span className="text-muted-foreground">Contracts</span>
              <span className="text-foreground">
                {Number(amount || 0)}
              </span>{" "}
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Average price per contract
              </span>
              <span className="text-foreground">
                {Number(amount || 0).toFixed(1)}¢
              </span>{" "}
              {/* Replace with actual number */}
            </div>

            {/* <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-foreground">
                ${" "}
                {(Number(price) * Number(amount)) / 100}
              </span>
            </div>
            */}

            <div className="flex justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Total return if</span>
                <span className="text-white">
                  {" "}
                  {` ${
                    activeView == "Yes"
                      ? firstLetterCase(outcomes?.[0]?.title || "yes")
                      : firstLetterCase(outcomes?.[1]?.title || "no")
                  }`}{" "}
                </span>
                <span className="text-muted-foreground"> wins</span>
              </div>
              <span className="text-green-500">
                $ {Number(amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="pt-1 pb-1 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Estimated amount to receive
            </span>
            <span className="text-foreground text-green-500">
              $ {Number(amount)}
            </span>
          </div>
        </div>
      )}

      <div className="pt-4">
        {signedIn ? (
          <Button
            className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
            onClick={() => handlePlaceOrder(buyorsell)}
          >
            {`${buyorsell === "buy" ? "Buy" : "Sell"} ${
              activeView == "Yes"
                ? firstLetterCase(outcomes?.[0]?.title || "yes")
                : firstLetterCase(outcomes?.[1]?.title || "no")
            }`}
          </Button>
        ) : (
          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
            Login
          </Button>
        )}
      </div>
      <CustomDateComponent
        showCustomDialog={showCustomDialog}
        setShowCustomDialog={setShowCustomDialog}
        customDate={customDate}
        setCustomDate={setCustomDate}
      />
    </>
  );
};
export default memo(LimitOrder);
