import React, { useContext, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "radix-ui";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { firstLetterCase } from "@/lib/stringCase";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/app/components/ui/tooltip";
import { useSelector } from "@/store";
import { availableBalance } from "@/lib/utils";
import LimitOrder from "./LimitOrder";
import MarketOrder from "./MarketOrder";
import OrderTypeDropdown from "./OrderTypeDropdown";
import { toFixedDown } from "@/lib/roundOf";
import { getPositionsByEvtId } from "@/services/user";
import { capitalize } from "@/app/helper/string";
import { isEmptyObject } from "@/app/helper/isEmpty";
import { SocketContext } from "@/config/socketConnectivity";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export function TradingCard({
  market,
  activeView,
  setActiveView,
  selectedOrderBookData,
  status,
  selectedOrder,
  image,
  title,
}) {
  const onTabChange = (value) => {
    setActiveView(value);
  };

  const descending = (a, b) => Number(b[0]) - Number(a[0]);
  const ascending = (a, b) => Number(a[0]) - Number(b[0]);
  const buyYes = selectedOrderBookData?.asks?.[0]?.sort(descending)?.[0] || [];
  const buyNo = selectedOrderBookData?.bids?.[0]?.sort(descending)?.[0] || [];
  const sellYes = selectedOrderBookData?.bids?.[0]?.[0] || [];
  const sellNo = selectedOrderBookData?.asks?.[0]?.[0] || [];
  const socketContext = useContext(SocketContext);

  const [orderType, setOrderType] = React.useState("limit");
  const [showCustomDialog, setShowCustomDialog] = React.useState(false);

  const [tab, setTab] = React.useState("buy");
  const [positions, setPositions] = React.useState({});
  // Calculate days left when customDate changes

  const fetchPositions = async () => {
    try {
      const { success, result } = await getPositionsByEvtId({
        id: market?._id,
      });
      if (success) {
        setPositions(result[0] || {});
      } else {
        setPositions({});
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  useEffect(() => {
    if (market) {
      fetchPositions();
    }
  }, [market]);

  useEffect(() => {
    let socket = socketContext?.socket;
    if (!socket) return;
    const handlePositions = (result) => {
      const resData = JSON.parse(result);
      // console.log("Received position update:", resData)
      if (resData?.quantity == 0) {
        setPositions({});
      } else {
        setPositions((prev) => {
          return {
            ...prev,
            filled: resData?.filled,
            quantity: resData?.quantity,
            side: resData?.side,
          };
        });
      }
    };
    socket.on("pos-update", handlePositions);
    return () => {
      socket.off("pos-update", handlePositions);
    };
  }, [socketContext]);
  const { signedIn } = useSelector((state) => state?.auth.session);
  const asset = useSelector((state) => state?.wallet?.data);

  return (
    <Card
      className="w-[100%] trading_card border border-[#282828]"
      style={{
        backgroundColor: "#000000",
        boxShadow: "0 2px 6px 0 rgba(220,220,255,0.13)",
      }}
    >
      <div className="w-[100%]">
        <CardHeader className="p-5">
          <CardTitle style={{ lineHeight: "1.5" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  overflow: "hidden",
                  borderRadius: "6px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={image}
                  alt="Event"
                  width={45}
                  height={45}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                className="text-[14px]"
                style={{ paddingLeft: "8px", marginRight: "0px" }}
              >
                {market?.groupItemTitle != ""
                  ? firstLetterCase(market?.groupItemTitle)
                  : firstLetterCase(title)}
              </div>
            </div>
          </CardTitle>
          {/* <CardDescription>
            {" "}
            $
            {market?.volume
              ? (market.volume / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
          </CardDescription> */}
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <Tabs
            defaultValue="buy"
            className="w-full"
            value={tab}
            onValueChange={setTab}
          >
            <div className="flex justify-between">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
              <OrderTypeDropdown
                orderType={orderType}
                setOrderType={setOrderType}
              />
            </div>
            <div className="w-full h-px bg-gray-600"></div>
            <TabsContent value="buy">
              <h1 className="pb-1 flex justify-between items-center min-h-[40px]">
                <span className="flex items-center gap-1">
                  Pick side{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-xs text-gray-400"
                          style={{ cursor: "pointer" }}
                        >
                          <InfoCircledIcon />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={8}
                        className="max-w-xs text-left text-xs"
                      >
                        {orderType === "limit"
                          ? "Please select Yes or No and specify a limit price between 1¢ and 99¢, reflecting the odds you believe, where a higher price indicates greater confidence. With a limit order, your investment is matched with other users taking the opposite side at the complementary price (100¢ minus your limit price, since the odds sum to 100%). The higher your limit price, the cheaper and more likely it is for the opposite side to match. If your prediction is correct, your shares settle at $1 (100% chance); if not, they expire at $0 (0% chance). You can sell your shares at any time for a price you choose to realize profits before resolution."
                          : "A market order will match you with the cheapest available ask price when buying, or the highest available bid price when selling. These prices reflect the odds other users have set for the outcome. If there are no contracts available in the order book at the moment, please place a limit order specifying your desired price, which represents the odds you believe in."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </h1>
            </TabsContent>
            <TabsContent value="sell">
              <h1 className="pb-1 flex justify-between items-center min-h-[40px]">
                <span className="flex items-center gap-1">
                  Your position{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-xs text-gray-400"
                          style={{ cursor: "pointer" }}
                        >
                          <InfoCircledIcon />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={8}
                        className="max-w-xs text-left text-xs"
                      >
                        {orderType === "limit"
                          ? "Please select Yes or No and specify a limit price between 1¢ and 99¢, reflecting the odds you believe, where a higher price indicates greater confidence. With a limit order, your investment is matched with other users taking the opposite side at the complementary price (100¢ minus your limit price, since the odds sum to 100%). The higher your limit price, the cheaper and more likely it is for the opposite side to match. If your prediction is correct, your shares settle at $1 (100% chance); if not, they expire at $0 (0% chance). You can sell your shares at any time for a price you choose to realize profits before resolution."
                          : "A market order will match you with the cheapest available ask price when buying, or the highest available bid price when selling. These prices reflect the odds other users have set for the outcome. If there are no contracts available in the order book at the moment, please place a limit order specifying your desired price, which represents the odds you believe in."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </h1>
            </TabsContent>

            <div className="pt-1">
              <Options
                defaultValue={activeView}
                value={activeView}
                onValueChange={onTabChange}
                className="w-full"
              >
                <OptionsList className="grid w-full grid-cols-2 gap-2">
                  <OptionsTrigger
                    className="rounded-md border-transparent hover:bg-[#0d1a26] hover:text-[#7dfdfe] data-[state=active]:bg-[#0d1a26] data-[state=active]:text-[#7dfdfe] data-[state=active]:border-[#0d1a26] relative group"
                    value="Yes"
                  >
                    {firstLetterCase(market?.outcome?.[0]?.title) || "Yes"}{" "}
                    {tab == "buy"
                      ? buyYes?.length > 0 &&
                        `${toFixedDown(100 - buyYes?.[0], 2)}¢`
                      : sellYes?.length > 0 &&
                        `${toFixedDown(sellYes?.[0], 2)}¢`}
                    {/* Tron blue border animation - hover and active states */}
                    <div className="absolute -inset-0.5 rounded-md z-20 pointer-events-none opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 rounded-md border border-[#00d4ff] animate-border-glow"></div>
                      <div className="absolute inset-0 rounded-md">
                        {/* Flowing lines */}
                        <div
                          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent animate-line-flow"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#00d4ff] to-transparent animate-line-flow-vertical"
                          style={{ animationDelay: "0.7s" }}
                        ></div>
                        <div
                          className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent animate-line-flow"
                          style={{ animationDelay: "1.2s" }}
                        ></div>
                        <div
                          className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#00d4ff] to-transparent animate-line-flow-vertical"
                          style={{ animationDelay: "1.7s" }}
                        ></div>
                      </div>
                    </div>
                  </OptionsTrigger>
                  <OptionsTrigger
                    className="rounded-md hover:bg-[#210d1a] hover:text-[#ec4899] data-[state=active]:bg-[#210d1a] data-[state=active]:text-[#ec4899] data-[state=active]:border-[#210d1a] relative group"
                    value="No"
                  >
                    {firstLetterCase(market?.outcome?.[1]?.title) || "No"}{" "}
                    {tab == "buy"
                      ? buyNo?.length > 0 &&
                        `${toFixedDown(100 - buyNo?.[0], 2)}¢`
                      : sellNo?.length > 0 && `${toFixedDown(sellNo?.[0], 2)}¢`}
                    {/* Pink border animation - hover and active states */}
                    <div className="absolute -inset-0.5 rounded-md z-20 pointer-events-none opacity-0 group-hover:opacity-100 group-data-[state=active]:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 rounded-md border border-[#ec4899] animate-border-glow"></div>
                      <div className="absolute inset-0 rounded-md">
                        {/* Flowing lines */}
                        <div
                          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent animate-line-flow"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#ec4899] to-transparent animate-line-flow-vertical"
                          style={{ animationDelay: "0.7s" }}
                        ></div>
                        <div
                          className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent animate-line-flow"
                          style={{ animationDelay: "1.2s" }}
                        ></div>
                        <div
                          className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#ec4899] to-transparent animate-line-flow-vertical"
                          style={{ animationDelay: "1.7s" }}
                        ></div>
                      </div>
                    </div>
                  </OptionsTrigger>
                </OptionsList>

                <OptionsContent value="Yes"></OptionsContent>
                <OptionsContent value="No"></OptionsContent>

                <div className="flex justify-between mt-4 mb-0">
                  <div>
                    {!isEmptyObject(positions) && (
                      <h1 className="text-xs text-gray-500">
                        {toFixedDown(positions?.quantity, 2)} &middot;{" "}
                        {capitalize(
                          positions?.side == "yes"
                            ? firstLetterCase(
                                market?.outcome?.[0]?.title || "yes"
                              )
                            : firstLetterCase(
                                market?.outcome?.[1]?.title || "no"
                              )
                        )}{" "}
                        ({positions?.filled?.[0]?.price?.toFixed(0)}¢) owned
                      </h1>
                    )}
                  </div>

                  <span className="text-xs text-gray-500">
                    Balance {signedIn ? `$${availableBalance(asset)}` : "$0.00"}
                  </span>
                </div>

                {orderType === "market" && (
                  <MarketOrder
                    activeView={activeView}
                    marketId={market?._id}
                    buyorsell={tab}
                    status={status}
                    selectedOrder={selectedOrder}
                    lastYesOrder={
                      tab == "buy"
                        ? buyYes?.length > 0 &&
                          toFixedDown(100 - buyYes?.[0], 2)
                        : sellYes?.length > 0 && toFixedDown(sellYes?.[0], 2)
                    }
                    lastNoOrder={
                      tab == "buy"
                        ? buyNo?.length > 0 && toFixedDown(100 - buyNo?.[0], 2)
                        : sellNo?.length > 0 && toFixedDown(sellNo?.[0], 2)
                    }
                    outcomes={market?.outcome}
                  />
                )}

                {orderType === "limit" && (
                  <LimitOrder
                    activeView={activeView}
                    marketId={market?._id}
                    buyorsell={tab}
                    status={status}
                    selectedOrder={selectedOrder}
                    outcomes={market?.outcome}
                    makerFee={market?.makerFee}
                    takerFee={market?.takerFee}
                  />
                )}
              </Options>
            </div>
          </Tabs>
        </CardContent>
      </div>
    </Card>
  );
}
