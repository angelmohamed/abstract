import React, { memo, useState } from "react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface MarketOrderProps {
  buyorsell: "buy" | "sell";
}

const initialFormValue = {
    price: "",
    amount: "",
}

interface FormState {
    price: string | number;
    amount: string | number;
}

const MarketOrder: React.FC<MarketOrderProps> = (props) => {
    const { buyorsell } = props;
  // state
  const [formValue, setFormValue] = useState<FormState>(initialFormValue);
  const { amount } = formValue;
  
  return (
    <>
      <div className="pt-2">
        <p className="text-muted-foreground text-sm text-right mb-1">
          Balance $8.96
        </p>
        <Input 
          type="text" 
          value={amount}
          name="amount"
          placeholder="Amount" 
          className="h-[85%] w-full" 
        />
        <div className="flex gap-2 pt-2 justify-between">
          <Button className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]">
            +$1
          </Button>
          <Button className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]">
            +$20
          </Button>
          <Button className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]">
            +$100
          </Button>
          <Button className="text-[13px] w-full h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]">
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
        <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
          {/* {`${tab === "buy" ? "Buy" : "Sell"} ${activeView}`} */}
          {buyorsell}
        </Button>
      </div>
    </>
  );
};

export default memo(MarketOrder);
