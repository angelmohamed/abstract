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

interface LimitOrderProps {
  activeView: string;
  marketId: string;
  buyorsell: "buy" | "sell";
  selectedOrder: any;
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
  const { activeView, marketId, buyorsell, selectedOrder } = props;

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
  const [expirationSeconds, setExpirationSeconds] = useState<number | null>(null);

  const { price, amount } = formValue;

  // function
  const handleChangeBtn = (op: "+" | "-", key: string, increment: number) => {
    if (op === "+") {
      setFormValue((prev) => ({ ...prev, [key]: Number(prev[key]) + increment }));
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
        const numericValue = value.replace(/[^0-9]/g, '');
        const priceNum = parseInt(numericValue);
        
        if (numericValue === '') {
          return { ...prev, [name]: '' };
        } else if (priceNum >= 1 && priceNum <= 99) {
          return { ...prev, [name]: numericValue };
        } else {
          return prev;
        }
      } else if (name === "amount") {
        const numericValue = value.replace(/[^0-9.]/g, '');
        
        const parts = numericValue.split('.');
        if (parts.length > 2) {
          return prev;
        }
        
        if (parts[1] && parts[1].length > 2) {
          return prev;
        }
        
        const amountNum = parseFloat(numericValue);
        
        if (numericValue === '' || numericValue === '.') {
          return { ...prev, [name]: numericValue };
        } else if (amountNum >= 0 && amountNum <= 100000) {
          return { ...prev, [name]: numericValue };
        } else {
          return prev;
        }
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
    }
    if (!amount) {
      errors.amount = "Shares field is required";
    }
    if (Number(amount) <= 0) {
      errors.amount = "Shares must be greater than 0";
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
      toastAlert("error", "You don't have any shares to sell", "no-position");
      return;
    }

    let amount = 0;
    if (percentage === 100) {
      amount = userPosition;
    } else {
      amount = Math.floor((userPosition * percentage) / 100);
    }

    setFormValue(prev => ({
      ...prev,
      amount
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
        <div className="flex flex-col">
          <span className="text-[#fff] text-[16px]">Limit Price</span>
          <p className="text-muted-foreground text-sm">
            Balance ${availableBalance(asset)}
          </p>
        </div>
        <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
          <span
            className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
            onClick={() => handleChangeBtn("-", "price", 1)}
          >
            -
          </span>
          <Input
            type="text"
            value={price}
            name="price"
            placeholder="0 ¢"
            onChange={handleChange}
            className="border-0 w-[100px] text-center bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
          <span
            className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", "price", 1)}
          >
            +
          </span>
        </div>
      </div>
      <span className="text-red-500">{errors?.price}</span>

      <div className="flex justify-between mt-3">
        <div className="flex flex-col">
          <span className="text-[#fff] text-[16px]">Shares</span>
          {/* <p className="text-muted-foreground text-sm cursor-pointer">{userPosition} Shares</p> */}
        </div>
        <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
          <Input
            type="text"
            name="amount"
            placeholder="0"
            value={amount}
            onChange={handleChange}
            className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          />
        </div>
      </div>
      <span className="text-red-500">{errors?.amount}</span>
      {buyorsell == "sell" ? (
        <div className="flex gap-2 pt-2 justify-end">
          <Button className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]" onClick={() => handlePercentageClick(25)}>
            25%
          </Button>
          <Button className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]" onClick={() => handlePercentageClick(50)}>
            50%
          </Button>
          <Button className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]" onClick={() => handlePercentageClick(100)}>
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
      )}

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
          className="border bg-[#131212] border-[#262626] bg-black rounded w-full p-3 mt-2 text-[14px]"
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

      {
        buyorsell == "buy" ? (
          <>
            <div className="pt-1 pb-1 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground">
                  {/* You can add logic for limit order shares */}
                  ${" "}{Number(price) * Number(amount) / 100}
                </span>
              </div>
            </div>

            <div className="pt-1 pb-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To Win</span>
                <span className="text-foreground">
                  {/* You can add logic for limit order shares */}
                  ${" "}{Number(amount)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="pt-1 pb-1 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                You&apos;ll receive
              </span>
              <span className="text-foreground">
                ${" "}{Number(amount)}
              </span>
            </div>
          </div>
        )
      }

      <div className="pt-4">
        {signedIn ? (
          <Button
            className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
            onClick={() => handlePlaceOrder(buyorsell)}
          >
            {`${buyorsell === "buy" ? "Buy" : "Sell"} ${activeView}`}
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
