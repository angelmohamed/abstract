import React, { memo, useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { availableBalance } from "@/lib/utils";
import { useSelector } from "@/store";
import { placeOrder } from "@/services/market";
import { toastAlert } from "@/lib/toast";

interface MarketOrderProps {
  activeView: string;
  marketId: string;
  buyorsell: "buy" | "sell";
}

const initialFormValue = {
    price: "",
    ordVal: "",
}

interface FormState {
    price: string | number;
    ordVal: string | number;
}

const MarketOrder: React.FC<MarketOrderProps> = (props) => {
  const { activeView, marketId, buyorsell } = props;
  const { signedIn } = useSelector((state) => state?.auth.session);
  const user = useSelector((state) => state?.auth.user);
  const asset = useSelector((state) => state?.wallet?.data);

  // state
  const [formValue, setFormValue] = useState<FormState>(initialFormValue);
  const { ordVal } = formValue;

  // function
  const handleChangeBtn = (op: "+" | "-" | "max", key: string, increment: number) => {
    if (op === "+") {
      setFormValue((prev) => ({ ...prev, [key]: Number(prev[key]) + increment }));
    } else if (op === "max") {
      setFormValue((prev) => ({ ...prev, [key]: Number(asset?.balance) - Number(asset?.locked) }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormValue((prev: any) => {
      const numericValue = value.replace(/[^0-9.]/g, '');
        
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        return prev;
      }
      
      if (parts[1] && parts[1].length > 2) {
        return prev;
      }
      
      const ordValNum = parseFloat(numericValue);
      
      if (numericValue === '' || numericValue === '.') {
        return { ...prev, [name]: numericValue };
      } else if (ordValNum >= 0 && ordValNum <= 100000) {
        return { ...prev, [name]: numericValue };
      } else {
        return prev;
      }
    });
  };

  const handlePlaceOrder = async (action: any) => {
    let activeTab = activeView?.toLowerCase();
    let data = {
      price: 0,
      side: action === "buy" ? activeTab : activeTab === "yes" ? "no" : "yes",
      userSide: activeTab,
      action: action,
      capped: action === "sell" ? true : false,
      marketId,
      userId: user?._id,
      ordVal: action === "buy" ? Number(ordVal) * 100: 0,
      type: "market",
    };
    const { success, message } = await placeOrder(data);
    if (success) {
      toastAlert("success", "Order placed successfully!", "order-success");
      setFormValue(initialFormValue);
    } else {
      toastAlert("error", message, "order-failed");
    }
  };

  return (
    <>
      <div className="pt-2">
        <p className="text-muted-foreground text-sm text-right mb-1">
          Balance {signedIn ? `${availableBalance(asset)}`: "--"}
        </p>
        <div className="flex justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-[#fff] text-[16px]">{buyorsell == "buy" ? "Amount" : "Shares"}</span>
            {/* <p className="text-muted-foreground text-sm cursor-pointer">{userPosition} Shares</p> */}
          </div>
          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
            <Input 
              type="text" 
              value={ordVal}
              name="ordVal"
              placeholder="0 $"
              onChange={handleChange}
              className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2 justify-between">
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", "ordVal", 1)}
          >
            +$1
          </Button>
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", "ordVal", 20)}
          >
            +$20
          </Button>
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", "ordVal", 100)}
          >
            +$100
          </Button>
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("max", "ordVal", 100)}
          >
            Max
          </Button>
        </div>
      </div>

      <div className="pt-4 space-y-2 pb-2">
        {/* Shares */}
        <div className="flex justify-between text-sm pt-2">
          <span className="text-muted-foreground">Shares</span>
          <span className="text-foreground">
            0
          </span>{" "}
        </div>

        {/* Average Price */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Average price</span>
          <span className="text-foreground">
            {0}¢
          </span>{" "}
        </div>

        {/* Potential Return */}
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Potential return if</span>
            <span className="text-white"> Yes </span>
            <span className="text-muted-foreground"> wins</span>
          </div>
          <span className="text-green-500">
            {/* ${toTwoDecimal(buyYes?.totalShares) || 0} */}
          </span>{" "}
          {/* Replace with actual number */}
        </div>
      </div>


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
    </>
  );
};

export default memo(MarketOrder);
