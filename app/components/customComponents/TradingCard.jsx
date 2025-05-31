import React, { useEffect } from "react";
import Ye from "/public/images/Ye.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { Comment } from "@/app/components/ui/comment";
import { Amount } from "@/app/components/ui/amount";
import { SharesInput } from "@/app/components/ui/sharesInput";
import { DropdownMenu, Switch, Dialog } from "radix-ui";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from "date-fns";
import Link from "next/link";
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
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import { getUserData, OrderPlace } from "@/app/ApiAction/api";
import isEmpty from "is-empty";
import { toastAlert } from "@/lib/toast";

export function TradingCard({
  market,
  activeView,
  setActiveView,
  selectedOrderBookData,
}) {
  const [amount, setAmount] = React.useState(0);
  const [shares, setShares] = React.useState(0);
  const [errors, setErrors] = React.useState({});
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

  // const buyYes = buyFunction(selectedOrderBookData?.[0]?.asks, amount);
  // const buyNo = buyFunction(selectedOrderBookData?.[1]?.asks, amount);
  // const sellYes = sellFunction(selectedOrderBookData?.[0]?.bids, shares);
  // const sellNo = sellFunction(selectedOrderBookData?.[1]?.bids, shares);

  const buyYes = selectedOrderBookData?.asks?.[0]?.reverse()?.[0] || [];
  const buyNo = selectedOrderBookData?.bids?.[0]?.reverse()?.[0] || [];
  const sellYes = selectedOrderBookData?.bids?.[0]?.[0] || [];
  const sellNo = selectedOrderBookData?.asks?.[0]?.[0] || [];

  const [orderType, setOrderType] = React.useState("limit");
  const [showCustomDialog, setShowCustomDialog] = React.useState(false);
  const [customDate, setCustomDate] = React.useState("");
  const [daysLeft, setDaysLeft] = React.useState(null);
  const [startDate, setStartDate] = React.useState(
    setHours(setMinutes(new Date(), 30), 17)
  );
  const [tab, setTab] = React.useState("buy");
  const [user, setUser] = React.useState({});

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value < 100) {
      setAmount(value);
    } else if (value < 0) {
      setAmount(0);
    } else {
      console.log(
        "Invalid amount entered. Please enter a number between 0 and 100."
      );
    }
  };

  const handleSharesChange = (operation) => {
    let balance = 10000;
    if (operation === "+") {
      setShares((prev) => Number(prev) + 10);
    } else if (operation === "-") {
      if (shares - 10 > 0) {
        setShares((prev) => Number(prev) - 10);
      } else {
        setShares(0);
      }
    } else if (operation == "25%") {
      setShares(Math.floor((balance * 25) / 100));
    } else if (operation == "50%") {
      setShares(Math.floor((balance * 50) / 100));
    } else if (operation == "max") {
      setShares(Math.floor((balance * 100) / 100));
    }
  };
  const handleAmountChangeUsingButton = (operation) => {
    if (operation === "+") {
      setAmount((prev) => Number(prev) + 1);
    } else if (operation === "-") {
      if (amount - 1 > 0) {
        setAmount((prev) => Number(prev) - 1);
      } else {
        setAmount(0);
      }
    }
  };

  // Calculate days left when customDate changes
  React.useEffect(() => {
    if (customDate) {
      const now = new Date();
      const diff = customDate - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days > 0 ? days : 0);
    } else {
      setDaysLeft(null);
    }
  }, [customDate]);
  const limitOrderValidation = () => {
    let errors = {};
    if (!amount) {
      errors.amount = "Amount field is required";
    }
    if (amount <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    if (!shares) {
      errors.shares = "Shares field is required";
    }
    if (shares <= 0) {
      errors.shares = "Shares must be greater than 0";
    }
    // if (customDate && customDate <= new Date()) {
    //   errors.customDate = "Custom date must be in the future";
    // }
    setErrors(errors);
    return Object.keys(errors).length > 0 ? false : true;
  };

  const handlePlaceOrder = async (action) => {
    if (orderType === "limit" && !limitOrderValidation()) {
      console.log("Validation failed", errors);
      return;
    }
    let userId = user?._id;
    let activeTab = activeView?.toLowerCase();
    // if(action == "sell"){
    //   return
    // }
    let data = {
      price: action === "sell" ? 100 - amount : amount,
      side: action === "buy" ? activeTab : activeTab === "yes" ? "no" : "yes",
      userSide: activeTab,
      action: action,
      capped: action === "sell" ? true : false,
      marketId: market._id,
      userId: userId,
      quantity: shares,
      type: orderType,
    };
    const response = await OrderPlace(data);
    if (response.status) {
      toastAlert("success", "Order placed successfully!", "order-success");
      setAmount(0);
      setShares(0);
    } else {
      toastAlert("error", response.message, "order-failed");
    }
    console.log("Placing order with data: ", market._id);
  };

  useEffect(() => {
    setAmount(0);
    setShares(0);
    setErrors({});
  }, [activeView, orderType, tab]);

  const getUserInfo = async () => {
    try {
      let { status, result } = await getUserData();
      if (status) {
        setUser(result);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);
  return (
    <Card className="w-[100%] h-auto" style={{ backgroundColor: "#161616" }}>
      <div className="w-[100%]">
        <CardHeader className="pb-3">
          <CardTitle style={{ lineHeight: "1.5" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* <div
                style={{
                  width: "55px",
                  height: "55px",
                  overflow: "hidden",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={market?.image || '/images/logo.png'}
                  alt="Event"
                  width={55}
                  height={55}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div> */}
              <div
                className="text-[16px]"
                style={{ paddingLeft: "8px", marginRight: "0px" }}
              >
                {market.question}
              </div>
            </div>
          </CardTitle>
          {/* <CardDescription>
            {" "}
            $
            {market.volume
              ? market.volume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
          </CardDescription> */}
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="buy"
            className="w-full"
            value={tab}
            onValueChange={setTab}
          >
            <div className="flex justify-between gap-3">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="flex items-center gap-2 p-2 text-[14px] font-normal"
                    aria-label="Customise options"
                  >
                    {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="DropdownMenuContent"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="text-[14px] p-2 cursor-pointer hover:bg-[#100f0f]"
                      onSelect={() => setOrderType("limit")}
                    >
                      <span>Limit</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="text-[14px] p-2 cursor-pointer hover:bg-[#100f0f]"
                      onSelect={() => setOrderType("market")}
                    >
                      <span>Market</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            <TabsContent value="buy">
              <div className="pt-4">
                {/* <h1 className="pb-2">Pick side ⓘ</h1> */}
                <Options
                  defaultValue={activeView}
                  value={activeView}
                  onValueChange={onTabChange}
                  className="w-full"
                >
                  <OptionsList className="grid w-full grid-cols-2 gap-2">
                    <OptionsTrigger
                      className=" border-transparent hover:bg-[#282828] data-[state=active]:bg-[#1f3e2c] data-[state=active]:text-[#27ae60] data-[state=active]:border-[#1f3e2c] uppercase"
                      value="Yes"
                    >
                      {buyYes?.length > 0
                        ? `${market?.outcome?.[0]?.title || "Yes"}   ${
                            100 - buyYes?.[0]
                          }¢`
                        : `${market?.outcome?.[0]?.title || "Yes"}`}
                    </OptionsTrigger>
                    <OptionsTrigger
                      className="hover:bg-[#282828] data-[state=active]:border-[#362020] data-[state=active]:text-[#e64800] data-[state=active]:bg-[#362020] uppercase"
                      value="No"
                    >
                      {buyNo?.length > 0
                        ? `${market?.outcome?.[1]?.title || "No"}   ${
                            100 - buyNo?.[0]
                          }¢`
                        : `${market?.outcome?.[1]?.title || "No"}`}
                    </OptionsTrigger>
                  </OptionsList>

                  {/* Market Order Content */}
                  {orderType === "market" && (
                    <>
                      <OptionsContent value="Yes">
                        <div className="pt-2">
                          <p className="text-muted-foreground text-sm text-right mb-1">
                            Balance $8.96
                          </p>
                          <Amount
                            setAmount={setAmount}
                            amount={amount}
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
                            <span className="text-muted-foreground">
                              Shares
                            </span>
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
                              {Number(buyYes?.[0]).toFixed(1) || 0}¢
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
                              <span className="text-muted-foreground">
                                {" "}
                                wins
                              </span>
                            </div>
                            <span className="text-green-500">
                              ${toTwoDecimal(buyYes?.totalShares) || 0}
                            </span>{" "}
                            {/* Replace with actual number */}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                            {`${tab === "buy" ? "Buy" : "Sell"} ${activeView}`}
                          </Button>
                        </div>
                      </OptionsContent>

                      <OptionsContent value="No">
                        <div className="pt-2">
                          <p className="text-muted-foreground text-sm text-right mb-1">
                            Balance $8.96
                          </p>
                          <Amount
                            setAmount={setAmount}
                            amount={amount}
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
                            <span className="text-muted-foreground">
                              Shares
                            </span>
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
                              {Number(buyNo?.averagePrice * 100).toFixed(1) ||
                                0}
                              ¢
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
                              <span className="text-muted-foreground">
                                {" "}
                                wins
                              </span>
                            </div>
                            <span className="text-green-500">
                              ${toTwoDecimal(buyNo?.totalShares) || 0}
                            </span>{" "}
                            {/* Replace with actual number */}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                            {`${tab === "buy" ? "Buy" : "Sell"} ${activeView}`}
                          </Button>
                        </div>
                      </OptionsContent>
                    </>
                  )}

                  {/* LIMIT ORDER CONTENT */}
                  {orderType === "limit" && (
                    <>
                      <OptionsContent value="Yes">
                        <div className="flex justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[#fff] text-[16px]">
                              Limit Price
                            </span>
                            <p className="text-muted-foreground text-sm">
                              Balance $8.96
                            </p>
                          </div>
                          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("-")}
                            >
                              -
                            </span>
                            <Input
                              type="number"
                              value={amount}
                              min="0"
                              step="0.01"
                              placeholder="0 ¢"
                              onChange={handleAmountChange}
                              className="border-0 w-[100px] text-center bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("+")}
                            >
                              +
                            </span>
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.amount}</span>

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
                              type="number"
                              placeholder="0"
                              value={shares}
                              onChange={(e) => setShares(e.target.value)}
                              className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.shares}</span>
                        <div className="flex gap-2 pt-2 justify-end">
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("-")}
                          >
                            -$10
                          </Button>
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("+")}
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

                        {customDate && (
                          <div className="text-sm text-[#fff] mt-2">
                            {daysLeft !== null &&
                              `Expires in ${daysLeft} day${
                                daysLeft === 1 ? "" : "s"
                              }`}
                          </div>
                        )}

                        <div className="pt-1 pb-1 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="text-foreground">
                              {/* You can add logic for limit order shares */}
                              {shares}
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
                              $0
                            </span>
                          </div>
                        </div>
                        <div className="pt-4">
                          {!isEmpty(user) ? (
                            <Button
                              className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                              onClick={() => handlePlaceOrder("buy")}
                            >
                              {`${
                                tab === "buy" ? "Buy" : "Sell"
                              } ${activeView}`}
                            </Button>
                          ) : (
                            <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                              Login to Place Order
                            </Button>
                          )}
                        </div>
                      </OptionsContent>
                      <OptionsContent value="No">
                        {/* <div className="pt-2">
                          <Amount
                            setAmount={setAmount}
                            amount={amount}
                            className="h-[85%] w-full"
                          />
                        </div> */}
                        <div className="flex justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[#fff] text-[16px]">
                              Limit Price
                            </span>
                            <p className="text-muted-foreground text-sm">
                              Balance $8.96
                            </p>
                          </div>
                          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("-")}
                            >
                              -
                            </span>
                            <Input
                              type="number"
                              value={amount}
                              min="0"
                              step="0.01"
                              placeholder="0 ¢"
                              onChange={handleAmountChange}
                              className="border-0 w-[100px] text-center bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("+")}
                            >
                              +
                            </span>
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.amount}</span>
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
                              type="number"
                              placeholder="0"
                              value={shares}
                              onChange={(e) => setShares(e.target.value)}
                              className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.shares}</span>
                        <div className="flex gap-2 pt-2 justify-end">
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("-")}
                          >
                            -$10
                          </Button>
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("+")}
                          >
                            +$10
                          </Button>
                        </div>
                        <div className="pt-4">
                          {!isEmpty(user) ? (
                            <Button
                              className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                              onClick={() => handlePlaceOrder("buy")}
                            >
                              {`${
                                tab === "buy" ? "Buy" : "Sell"
                              } ${activeView}`}
                            </Button>
                          ) : (
                            <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                              Login to Place Order
                            </Button>
                          )}
                        </div>
                      </OptionsContent>
                    </>
                  )}
                </Options>
              </div>
            </TabsContent>
            <TabsContent value="sell">
              <div className="pt-4">
                {/* <h1 className="pb-2">Your position ⓘ</h1> */}
                <Options
                  defaultValue={activeView}
                  value={activeView}
                  onValueChange={onTabChange}
                  className="w-full"
                >
                  <OptionsList className="grid w-full grid-cols-2 gap-2">
                    <OptionsTrigger
                      className="data-[state=active]:text-[#27ae60] border-transparent hover:bg-[#282828] data-[state=active]:bg-[#1f3e2c] data-[state=active]:text-[#27ae60] data-[state=active]:border-[#1f3e2c] uppercase"
                      value={"Yes"}
                    >
                      {sellYes?.length > 0
                        ? `${market?.outcome?.[0]?.title || "Yes"}   ${
                            sellYes?.[0]
                          }¢`
                        : `${market?.outcome?.[0]?.title || "Yes"}`}
                    </OptionsTrigger>
                    <OptionsTrigger
                      className="hover:bg-[#282828] data-[state=active]:bg-[#362020] data-[state=active]:text-[#e64800] data-[state=active]:border-[#362020] uppercase"
                      value={"No"}
                    >
                      {sellNo?.length > 0
                        ? `${market?.outcome?.[1]?.title || "No"}   ${
                            sellNo?.[0]
                          }¢`
                        : `${market?.outcome?.[1]?.title || "No"}`}
                    </OptionsTrigger>
                  </OptionsList>
                  {/* MARKET ORDER CONTENT */}
                  {orderType === "market" && (
                    <>
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
                              {Number(sellYes?.averagePrice * 100).toFixed(1) ||
                                0}
                              ¢
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
                          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                            {`${tab === "buy" ? "Buy" : "Sell"} ${activeView}`}
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
                              {Number(sellNo?.averagePrice * 100).toFixed(1) ||
                                0}
                              ¢
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
                          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                            {`${tab === "buy" ? "Buy" : "Sell"} ${activeView}`}
                          </Button>
                        </div>
                      </OptionsContent>
                    </>
                  )}

                  {/* LIMIT ORDER CONTENT */}
                  {orderType === "limit" && (
                    <>
                      <OptionsContent value="Yes">
                        <div className="flex justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[#fff] text-[16px]">
                              Limit Price
                            </span>
                            <p className="text-muted-foreground text-sm">
                              Balance $8.96
                            </p>
                          </div>
                          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("-")}
                            >
                              -
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={amount}
                              onChange={handleAmountChange}
                              placeholder="0 ¢"
                              className="border-0 w-[100px] text-center bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("+")}
                            >
                              +
                            </span>
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.amount}</span>

                        <div className="flex justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[#fff] text-[16px]">
                              Shares
                            </span>
                          </div>
                          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                            <Input
                              type="number"
                              placeholder="0"
                              value={shares}
                              onChange={(e) => setShares(e.target.value)}
                              className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.shares}</span>
                        <div className="flex gap-2 pt-2 justify-end">
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("25%")}
                          >
                            25%
                          </Button>
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("50%")}
                          >
                            50%
                          </Button>
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("max")}
                          >
                            Max
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

                        {customDate && (
                          <div className="text-sm text-[#fff] mt-2">
                            {daysLeft !== null &&
                              `Expires in ${daysLeft} day${
                                daysLeft === 1 ? "" : "s"
                              }`}
                          </div>
                        )}

                        <div className="pt-1 pb-1 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              You&apos;ll receive
                            </span>
                            <span className="text-foreground">
                              {/* You can add logic for limit order shares */}
                              $0
                            </span>
                          </div>
                        </div>
                        <div className="pt-4">
                          {!isEmpty(user) ? (
                            <Button
                              className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                              onClick={() => handlePlaceOrder("sell")}
                            >
                              {`${
                                tab === "buy" ? "Buy" : "Sell"
                              } ${activeView}`}
                            </Button>
                          ) : (
                            <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                              Login to Place Order
                            </Button>
                          )}
                        </div>
                      </OptionsContent>
                      <OptionsContent value="No">
                        {/* <div className="pt-2">
                          <Amount
                            setAmount={setAmount}
                            amount={amount}
                            className="h-[85%] w-full"
                          />
                        </div> */}
                        <div className="flex justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[#fff] text-[16px]">
                              Limit Price
                            </span>
                            <p className="text-muted-foreground text-sm">
                              Balance $8.96
                            </p>
                          </div>
                          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("-")}
                            >
                              -
                            </span>
                            <Input
                              type="number"
                              value={amount}
                              min="0"
                              step="0.01"
                              placeholder="0 ¢"
                              onChange={handleAmountChange}
                              className="border-0 w-[100px] text-center bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <span
                              className="cursor-pointer text-[16px] p-3 hover:bg-[#262626]"
                              onClick={() => handleAmountChangeUsingButton("+")}
                            >
                              +
                            </span>
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.amount}</span>
                        {/* <div className="pt-4 space-y-2 pb-2">
                          <div className="flex justify-between text-sm pt-2">
                            <span className="text-muted-foreground">
                              Shares
                            </span>
                            <span className="text-foreground">{shares}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Limit Price
                            </span>
                            <span className="text-foreground">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Set price (¢)"
                                className="w-24"
                              />
                            </span>
                          </div>
                        </div> */}
                        <div className="flex justify-between mt-3">
                          <div className="flex flex-col">
                            <span className="text-[#fff] text-[16px]">
                              Shares
                            </span>
                          </div>
                          <div className="flex items-center border border-input rounded-md bg-background px-0 py-0 h-12 overflow-hidden">
                            <Input
                              type="number"
                              placeholder="0"
                              value={shares}
                              onChange={(e) => setShares(e.target.value)}
                              className="border-0 w-[150px] text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </div>
                        <span className="text-red-500">{errors?.shares}</span>
                        <div className="flex gap-2 pt-2 justify-end">
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("25%")}
                          >
                            25%
                          </Button>
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("50%")}
                          >
                            50%
                          </Button>
                          <Button
                            className="text-[13px] h-8 rounded bg-[trasparent] border border-[#262626] text-[#fff] hover:bg-[#262626]"
                            onClick={() => handleSharesChange("max")}
                          >
                            Max
                          </Button>
                        </div>
                        <div className="pt-4">
                          {!isEmpty(user) ? (
                            <Button
                              className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300"
                              onClick={() => handlePlaceOrder("sell")}
                            >
                              {`${
                                tab === "buy" ? "Buy" : "Sell"
                              } ${activeView}`}
                            </Button>
                          ) : (
                            <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-black transition-colors duration-300">
                              Login to Place Order
                            </Button>
                          )}
                        </div>
                      </OptionsContent>
                    </>
                  )}
                </Options>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </div>

      {/* Custom Date */}
      <Dialog.Root open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#181818] p-6 rounded-lg w-full max-w-md shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-4 text-center">
              Set Custom Expiry
            </Dialog.Title>
            <div className="mt-4">
              <label className="block mb-2">Pick a date and time:</label>
              {/* <Input
                type="datetime-local"
                className="border p-2 rounded w-full justify-center"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              /> */}
              <DatePicker
                className="custom_datepicker border p-2 rounded w-full"
                selected={customDate}
                onChange={(date) => setCustomDate(date)}
                showTimeSelect
                minDate={new Date()}
                minTime={setHours(setMinutes(new Date(), 0), 17)}
                maxTime={setHours(setMinutes(new Date(), 30), 20)}
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowCustomDialog(false)}>Apply</Button>
            </div>
            <Dialog.Close asChild>
              <button className="modal_close_brn" aria-label="Close">
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Card>
  );
}
