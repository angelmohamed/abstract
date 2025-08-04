import React, { memo, useEffect, useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { availableBalance } from "@/lib/utils";
import { useSelector } from "@/store";
import { placeOrder } from "@/services/market";
import { toastAlert } from "@/lib/toast";
import { isEmpty } from "@/lib/isEmpty";
import { toFixedDown } from "@/lib/roundOf";
import { firstLetterCase } from "@/lib/stringCase";

interface MarketOrderProps {
  activeView: string;
  marketId: string;
  buyorsell: "buy" | "sell";
  selectedOrder: any;
  lastYesOrder: any;
  lastNoOrder: any;
  outcomes: any;
}

const initialFormValue = {
    price: "",
    ordVal: "",
    amount: "",
}

interface FormState {
    price: string | number;
    ordVal: string | number;
    amount: string | number;
}

interface ErrorState {
  ordVal?: string;
  amount?: string;
}

interface ErrorState {
  ordVal?: string;
  amount?: string;
}

const MarketOrder: React.FC<MarketOrderProps> = (props) => {
  const { activeView, marketId, buyorsell, selectedOrder,lastYesOrder,lastNoOrder, outcomes } = props;
  const { signedIn } = useSelector((state) => state?.auth.session);
  const user = useSelector((state) => state?.auth.user);
  const asset = useSelector((state) => state?.wallet?.data);

  // state
  const [formValue, setFormValue] = useState<FormState>(initialFormValue);
  const { ordVal, amount } = formValue;
  const [errors, setErrors] = useState<ErrorState>({});


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
      if (name === "ordVal") {
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
      } else if (name === "amount") {
        // const numericValue = value.replace(/[^0-9.]/g, '');
        
        // const parts = numericValue.split('.');
        // if (parts.length > 2) {
        //   return prev;
        // }
        
        // if (parts[1] && parts[1].length > 2) {
        //   return prev;
        // }
        
        // const amountNum = parseFloat(numericValue);
        
        // if (numericValue === '' || numericValue === '.') {
        //   return { ...prev, [name]: numericValue };
        // } else if (amountNum >= 0 && amountNum <= 100000) {
        //   return { ...prev, [name]: numericValue };
        // } else {
        //   return prev;
        // }
        // const numericValue = value.replace(/[^0-9]/g, ''); // Only digits, no decimal point

        if (value === '') {
          return { ...prev, [name]: '' };
        }
        
        
        
        // const amountNum = parseInt(numericValue, 10);
        
        // if (!isNaN(amountNum) && amountNum >= 0 && amountNum <= 100000) {
        //   return { ...prev, [name]: numericValue };
        // }
        let numval = parseInt(value,10)
        if(numval){
          return { ...prev, [name]: numval };
        } else {
          return { ...prev, [name]: 0 };
        }
        
        // return prev;
      }
    });
  };

  const marketOrderValidation = () => {
    let errors: any = {};
    if( buyorsell === "buy"){
      if (!ordVal) {
        errors.ordVal = "Amount field is required";
      }
      if (Number(ordVal) <= 0) {
        errors.ordVal = "Amount must be greater than 0";
      }
    }
     if( buyorsell === "sell"){
      if (!amount) {
        errors.amount = "Contracts field is required";
      }
      if (Number(amount) <= 0) {
        errors.amount = "Contracts must be greater than 0";
      }
    }
    // if (customDate && customDate <= new Date()) {
    //   errors.customDate = "Custom date must be in the future";
    // }
    setErrors(errors);
    return Object.keys(errors).length > 0 ? false : true;
  };

  console.log("amount",amount,"error",errors)

  useEffect(() => {
    setFormValue(initialFormValue);
    setErrors({});
  }, [activeView, buyorsell, marketId]);

  const handlePlaceOrder = async (action: any) => {
    let activeTab = activeView?.toLowerCase();
    if (!marketOrderValidation()) {
      return;
    }
    let data = {
      price: 0,
      side: action === "buy" ? activeTab : activeTab === "yes" ? "no" : "yes",
      userSide: activeTab,
      action: action,
      capped: action === "sell" ? true : false,
      marketId,
      userId: user?._id,
      ordVal: action === "buy" ? Number(ordVal) * 100: 0,
      quantity: action === "sell" ? Number(amount): 0,
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

  useEffect(() => {
    console.log(selectedOrder, "selectedOrder1")
    if (isEmpty(selectedOrder)) {
      return;
    }

    if (buyorsell == "buy" && selectedOrder?.bidOrAsk == "ask") {
      setFormValue({
        ...formValue,
        ordVal: selectedOrder?.ordCost || "",
      });
    } else if (buyorsell == "sell" && selectedOrder?.bidOrAsk == "bid") {
      setFormValue({
        ...formValue,
        amount: selectedOrder?.row[1] || "",
      })
    } else {
      setFormValue(initialFormValue);
    }
  }, [selectedOrder]);

  return (
    <>
      <div className="mt-3">
        {/* <p className="text-muted-foreground text-sm text-right mb-1">
          Balance {signedIn ? `$${availableBalance(asset)}`: "--"}
        </p> */}
        <div className="flex justify-between">
          {/* <div className="flex flex-col">
            <span className="text-[#fff] text-[16px]">{buyorsell == "buy" ? "Amount" : "Shares"}</span>            
          </div> */}
          <div className="w-full flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
            <Input 
              type="text" 
              value={buyorsell == "buy" ? ordVal: amount}
              name={buyorsell == "buy" ? "ordVal": "amount"}
              // placeholder={buyorsell == "buy"  ? "0 $": "0"}
              placeholder="Amount"
              onChange={handleChange}
              className="border-0 text-left bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            />
            <span className="cursor-default text-[16px] p-3">{buyorsell == "buy" ? "USD" : "Contracts"}</span>
          </div>
        </div>
        {errors.ordVal && <p className="text-red-500 text-sm">{errors.ordVal}</p>}
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
        {/* <div className="flex gap-2 pt-2 justify-between">
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", buyorsell == "buy" ? "ordVal": "amount", 1)}
          >
            +$1
          </Button>
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", buyorsell == "buy" ? "ordVal": "amount", 20)}
          >
            +$20
          </Button>
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("+", buyorsell == "buy" ? "ordVal": "amount", 100)}
          >
            +$100
          </Button>
          <Button 
            className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
            onClick={() => handleChangeBtn("max", buyorsell == "buy" ? "ordVal": "amount", 100)}
          >
            Max
          </Button>
        </div> */}
      </div>
    {(activeView === "Yes" ? lastYesOrder : lastNoOrder) && (
      <div className="pt-2 space-y-2 pb-2">
        {/* Shares */}
        <div className="flex justify-between text-sm pt-2">
          <span className="text-muted-foreground">Contracts</span>
          <span className="text-foreground">
            {buyorsell == "sell" && (amount || 0)}
            {buyorsell === "buy"
            ? (() => {
                const divisor = activeView === "Yes" ? lastYesOrder || 0 : lastNoOrder || 0;
                if (divisor === 0) return "";
                return (Math.floor(Number(ordVal) * 100 / divisor))
              })()
            : ""}
          </span>{" "}
        </div>

        {/* Average Price */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Average price per contract</span>
          <span className="text-foreground">
            {activeView == "Yes" ? lastYesOrder : lastNoOrder}¢
          </span>{" "}
        </div>

        {/* Potential Return */}
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Total return if</span>
            <span className="text-white">  {`${activeView == "Yes" ? (firstLetterCase(outcomes?.[0]?.title || "yes")) : firstLetterCase(outcomes?.[1]?.title || "no")}
            `} </span>
            <span className="text-muted-foreground"> wins</span>
          </div>
          <span className="text-green-500">
            {/* ${toTwoDecimal(buyYes?.totalShares) || 0} */}
            $
            {buyorsell == "sell" && (amount || 0)}
            {buyorsell === "buy"
            ? (() => {
                const divisor = activeView === "Yes" ? lastYesOrder || 0 : lastNoOrder || 0;
                if (divisor === 0) return "";
                return (Math.floor(Number(ordVal) * 100 / divisor))
              })()
            : ""}
          </span>{" "}
          {/* Replace with actual number */}
        </div>
      </div>
    )}


      <div className="pt-4">
        {signedIn ? (
          <Button
            className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
            onClick={() => handlePlaceOrder(buyorsell)}
          >
            {`${buyorsell === "buy" ? "Buy" : "Sell"} ${activeView == "Yes" ? (firstLetterCase(outcomes?.[0]?.title || "yes")) : firstLetterCase(outcomes?.[1]?.title || "no")}
            `}
          </Button>
        ) : (
          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
            Login
          </Button>
        )}
          {/* <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300" disabled>
            Order cannot placed right now
          </Button> */}
      </div>
    </>
  );
};

export default memo(MarketOrder);
