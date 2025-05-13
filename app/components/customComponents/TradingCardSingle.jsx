"use client";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { decimalToPercentage } from "@/utils/helpers";

export function TradingCardSingle({
  activeView,
  setActiveView,
  market,
  selectedOrderBookData,
  orderBookYes,
  OrderBookNo,
}) {
  const [selectMarket, setSelectMarket] = React.useState("Market");
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
  return (
    <Card className="w-[100%] h-auto" style={{ backgroundColor: "#161616" }}>
      <div className="w-[100%]">
        <Select
          onValueChange={setSelectMarket}
          defaultValue={selectMarket}
          value={selectMarket}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Market" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Market">Market</SelectItem>
              <SelectItem value="Limit">Limit</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

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
                    <OptionsTrigger value="Yes">
                      {lowestAskYes
                        ? `Yes   ${decimalToPercentage(lowestAskYes)}¢`
                        : "Yes"}
                    </OptionsTrigger>
                    <OptionsTrigger
                      className="border-pink-500 text-pink-500 hover:bg-[#430a36] data-[state=active]:bg-[#430a36] data-[state=active]:border-pink-500 data-[state=active]:text-pink-500"
                      value="No"
                    >
                      {lowestAskNo
                        ? `No   ${decimalToPercentage(lowestAskNo)}¢`
                        : "No"}
                    </OptionsTrigger>
                  </OptionsList>
                  <OptionsContent value="Yes">
                    <div className="pt-2">
                      <Amount className="h-[85%] w-full" />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      {/* Shares */}
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="text-foreground">100</span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Average price
                        </span>
                        <span className="text-foreground">$20.00</span>{" "}
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
                        <span className="text-foreground">$500.00</span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                        Place Trade
                      </Button>
                    </div>
                  </OptionsContent>

                  <OptionsContent value="No">
                    <div className="pt-2">
                      <Amount className="h-[85%] w-full" />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      {/* Shares */}
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Shares</span>
                        <span className="text-foreground">100</span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Average price
                        </span>
                        <span className="text-foreground">$20.00</span>{" "}
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
                        <span className="text-foreground">$500.00</span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                        Place Trade
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
                    <OptionsTrigger value={"Yes"}>
                      {" "}
                      {lowestBidYes
                        ? `Yes   ${decimalToPercentage(lowestBidYes)}¢`
                        : "Yes"}
                    </OptionsTrigger>
                    <OptionsTrigger
                      className="border-pink-500 text-pink-500 hover:bg-[#430a36] data-[state=active]:bg-[#430a36] data-[state=active]:border-pink-500 data-[state=active]:text-pink-500"
                      value={"No"}
                    >
                      {lowestBidNo
                        ? `No   ${decimalToPercentage(lowestBidNo)}¢`
                        : "No"}
                    </OptionsTrigger>
                  </OptionsList>
                  <OptionsContent value="Yes">
                    <div className="pt-2">
                      <SharesInput className="h-[85%] w-full" />
                    </div>

                    <div className="pt-4 space-y-2 pb-2">
                      <div className="flex justify-between text-sm pt-2">
                        <div>
                          <span className="text-muted-foreground">
                            Average price return per
                          </span>
                          <span className="text-white"> Yes</span>
                        </div>
                        <span className="text-foreground">$500.00</span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimated amount to receive
                        </span>
                        <span className="text-foreground">$20.00</span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                        Place Trade
                      </Button>
                    </div>
                  </OptionsContent>

                  <OptionsContent value="No">
                    <div className="pt-2">
                      <SharesInput className="h-[85%] w-full" />
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
                        <span className="text-foreground">$500.00</span>{" "}
                        {/* Replace with actual number */}
                      </div>

                      {/* Average Price */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimated amount to receive
                        </span>
                        <span className="text-foreground">$20.00</span>{" "}
                        {/* Replace with actual number */}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                        Place Trade
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
