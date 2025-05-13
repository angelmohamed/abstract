import React from "react";
import Ye from "/public/images/Ye.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { Comment } from "@/app/components/ui/comment";
import { Amount } from "@/app/components/ui/amount";
import { SharesInput } from "@/app/components/ui/sharesInput";



import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

import {
  Options,
  OptionsContent,
  OptionsList,
  OptionsTrigger,
} from "@/app/components/ui/optionsToggle";
import {
  buyFunction,
  decimalToPercentage,
  sellFunction,
  toTwoDecimal,
} from "@/utils/helpers";

export function TradingCard({
  market,
  activeView,
  setActiveView,
  selectedOrderBookData,
}) {
  const [amount, setAmount] = React.useState(0);
  const [shares, setShares] = React.useState(0);
  const sortedYesAsks =
    selectedOrderBookData &&
    selectedOrderBookData[0] &&
    selectedOrderBookData[0].asks.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  const sortedNoAsks =
    selectedOrderBookData &&
    selectedOrderBookData[1] &&
    selectedOrderBookData[1].asks.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  const sortedYesBids =
    selectedOrderBookData &&
    selectedOrderBookData[0] &&
    selectedOrderBookData[0].bids.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  const sortedNoBids =
    selectedOrderBookData &&
    selectedOrderBookData[1] &&
    selectedOrderBookData[1].bids.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  const lowestAskYes = sortedYesAsks?.[sortedYesAsks?.length - 1]?.price;
  const lowestAskNo = sortedNoAsks?.[sortedNoAsks?.length - 1]?.price;
  const lowestBidYes = sortedYesBids?.[0]?.price;
  const lowestBidNo = sortedNoBids?.[0]?.price;
  const onTabChange = (value) => {
    setActiveView(value);
  };

  const buyYes = buyFunction(selectedOrderBookData?.[0]?.asks, amount);
  const buyNo = buyFunction(selectedOrderBookData?.[1]?.asks, amount);
  const sellYes = sellFunction(selectedOrderBookData?.[0]?.bids, shares);
  const sellNo = sellFunction(selectedOrderBookData?.[1]?.bids, shares);

  return (
    <Card className="w-[100%] h-auto" style={{ backgroundColor: "#161616" }}>
      <div className="w-[100%]">
        <CardHeader>
          <CardTitle style={{ lineHeight: "1.5" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <div 
                  style={{ 
                    width: "55px", 
                    height: "55px", 
                    overflow: "hidden", 
                    borderRadius: "8px", 
                    flexShrink: 0 
                  }}
                >
                  <Image 
                    src={market.image} 
                    alt="Event" 
                    width={55} 
                    height={55} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
              <div className="text-[16px]" style={{ paddingLeft:"8px", marginRight: "0px" }}>
                {market.question}
              </div>
            </div>
          </CardTitle>
          <CardDescription>  ${market.volume ? market.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy">
              <div className="pt-4">
                <h1 className="pb-2">Pick side ⓘ</h1>
                <Options
                  defaultValue={activeView}
                  value={activeView}
                  onValueChange={onTabChange}
                  className="w-full"
                >
                  <OptionsList className="grid w-full grid-cols-2 gap-2">
                    <OptionsTrigger 
                    className=  " border-transparent hover:bg-[#e0e0e0] data-[state=active]:bg-[#152632] data-[state=active]:text-[#7DFDFE] data-[state=active]:border-[#152632]"
                    value="Yes">
                      {lowestAskYes
                        ? `Yes   ${Number(lowestAskYes * 100).toFixed(1)}¢`
                        : "Yes"}
                    </OptionsTrigger>
                    <OptionsTrigger
                      className="hover:bg-[#e0e0e0] data-[state=active]:border-[#321b29] data-[state=active]:text-[#ffe0f3] data-[state=active]:bg-[#321b29]"
                      value="No"
                    >
                      {lowestAskNo
                        ? `No   ${Number(lowestAskNo * 100).toFixed(1)}¢`
                        : "No"}
                    </OptionsTrigger>
                  </OptionsList>
                  <OptionsContent value="Yes">
                    <div className="pt-2">
                      <Amount
                        setAmount={setAmount}
                        amount={amount}
                        className="h-[85%] w-full"
                      />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      {/* Shares */}
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="text-foreground">
                          {(buyYes?.totalShares &&
                            toTwoDecimal(buyYes?.totalShares)) ||
                            0}
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Average price
                        </span>
                        <span className="text-foreground">
                          {Number((buyYes?.averagePrice)*100).toFixed(1) || 0}¢
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Potential Return */}
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Potential return if
                          </span>
                          <span className="text-white"> Yes </span>
                          <span className="text-muted-foreground"> wins</span>
                        </div>
                        <span className="text-green-500">
                          ${toTwoDecimal(buyYes?.totalShares) || 0}
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                    <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">Trading Unavailable</Button>
                    </div>
                  </OptionsContent>

                  <OptionsContent value="No">
                    <div className="pt-2">
                      <Amount
                        setAmount={setAmount}
                        amount={amount}
                        className="h-[85%] w-full"
                      />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      {/* Shares */}
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="text-foreground">
                          {(buyNo?.totalShares &&
                            toTwoDecimal(buyNo?.totalShares)) ||
                            0}
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Average price
                        </span>
                        <span className="text-foreground">
                          {Number((buyNo?.averagePrice)*100).toFixed(1) || 0}¢
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Potential Return */}
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Potential return if
                          </span>
                          <span className="text-white"> No </span>
                          <span className="text-muted-foreground"> wins</span>
                        </div>
                        <span className="text-green-500">
                          ${toTwoDecimal(buyNo?.totalShares) || 0}
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                    <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">Trading Unavailable
                    </Button>
                    </div>
                  </OptionsContent>
                </Options>
              </div>
            </TabsContent>
            <TabsContent value="sell">
              <div className="pt-4">
                <h1 className="pb-2">Your position ⓘ</h1>
                <Options
                  defaultValue={activeView}
                  value={activeView}
                  onValueChange={onTabChange}
                  className="w-full"
                >
                  <OptionsList className="grid w-full grid-cols-2 gap-2">
                    <OptionsTrigger 
                      className=  "data-[state=active]:text-[#7DFDFE] border-transparent hover:bg-[#e0e0e0] data-[state=active]:bg-[#152632] data-[state=active]:text-[#7DFDFE] data-[state=active]:border-[#152632]"

                    value={"Yes"}>
                      {lowestBidYes
                        ? `Yes   ${Number(lowestBidYes * 100).toFixed(1)}¢`
                        : "Yes"}
                    </OptionsTrigger>
                    <OptionsTrigger
                      className="hover:bg-[#e0e0e0] data-[state=active]:bg-[#321b29] data-[state=active]:text-[#ffe0f3] data-[state=active]:border-[#321b29]"

                      value={"No"}
                    >
                      {lowestBidNo
                        ? `No   ${Number(lowestBidNo * 100).toFixed(1)}¢`
                        : "No"}
                    </OptionsTrigger>
                  </OptionsList>
                  <OptionsContent value="Yes">
                    <div className="pt-2">
                      <SharesInput
                        setShares={setShares}
                        shares={shares}
                        className="h-[85%] w-full"
                      />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      <div className="flex justify-between text-sm pt-2">
                        <div>
                          <span className="text-muted-foreground">
                            Average price return per
                          </span>
                          <span className="text-white"> Yes</span>
                        </div>
                        <span className="text-foreground">
                          {Number((sellYes?.averagePrice)*100).toFixed(1) || 0}¢
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimated amount to receive
                        </span>
                        <span className="text-green-500">
                          ${toTwoDecimal(sellYes?.totalValue) || 0}
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                    <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">Trading Unavailable
                  </Button>
                    </div>
                  </OptionsContent>

                  <OptionsContent value="No">
                    <div className="pt-2">
                      <SharesInput
                        setShares={setShares}
                        shares={shares}
                        className="h-[85%] w-full"
                      />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      {/* Shares */}
                      <div className="flex justify-between text-sm pt-2">
                        <div>
                          <span className="text-muted-foreground">
                            Average price return per
                          </span>
                          <span className="text-white"> No</span>
                        </div>
                        <span className="text-foreground">
                          {Number((sellNo?.averagePrice)*100).toFixed(1) || 0}¢
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimated amount to receive
                        </span>
                        <span className="text-green-500">
                          ${toTwoDecimal(sellNo?.totalValue) || 0}
                        </span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                    <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">Trading Unavailable
                    </Button>
                    </div>
                  </OptionsContent>
                </Options>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  );
}
