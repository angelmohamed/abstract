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
import { useSelector } from "@/store";

import LimitOrder from "./LimitOrder";
import MarketOrder from "./MarketOrder";
import OrderTypeDropdown from "./OrderTypeDropdown";
import { toFixedDown } from "@/lib/roundOf";
import { getPositionsByEvtId } from "@/services/user";
import { capitalize } from "@/app/helper/string";
import { isEmptyObject } from "@/app/helper/isEmpty";
import { SocketContext } from "@/config/socketConnectivity";

export function TradingCard({
  market,
  activeView,
  setActiveView,
  selectedOrderBookData,
  status,
  selectedOrder,
  image,
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

  return (
    <Card
      className="w-[100%] trading_card"
      style={{ backgroundColor: "#161616" }}
    >
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
                  flexShrink: 0,
                }}
              >
                <img
                  src={image}
                  alt="Event"
                  width={55}
                  height={55}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                className="text-[16px]"
                style={{ paddingLeft: "8px", marginRight: "0px" }}
              >
                {market.groupItemTitle}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            {" "}
            $
            {market.volume
              ? market.volume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
          </CardDescription>
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
              <OrderTypeDropdown
                orderType={orderType}
                setOrderType={setOrderType}
              />
            </div>
            <TabsContent value="buy"></TabsContent>
            <TabsContent value="sell"></TabsContent>
            {!isEmptyObject(positions) && (
              <h1
                className="pt-2"
                style={{
                  color: positions?.side === "yes" ? "#7dfdfe" : "#ec4899",
                }}
              >
                {toFixedDown(positions?.quantity, 2)} &middot;{" "}
                {capitalize(positions?.side)} (
                {positions?.filled?.[0]?.price?.toFixed(0)}¢) owned
              </h1>
            )}
            <div className="pt-2">
              <Options
                defaultValue={activeView}
                value={activeView}
                onValueChange={onTabChange}
                className="w-full"
              >
                <OptionsList className="grid w-full grid-cols-2 gap-2">
                  <OptionsTrigger
                    className=" border-transparent hover:bg-[#282828] data-[state=active]:bg-[#152632] data-[state=active]:text-[#7dfdfe] data-[state=active]:border-[#152632]"
                    value="Yes"
                  >
                    {firstLetterCase(market?.outcome?.[0]?.title) || "Yes"}{" "}
                    {tab == "buy"
                      ? buyYes?.length > 0 &&
                        `${toFixedDown(100 - buyYes?.[0], 2)}¢`
                      : sellYes?.length > 0 &&
                        `${toFixedDown(sellYes?.[0], 2)}¢`}
                  </OptionsTrigger>
                  <OptionsTrigger
                    className="hover:bg-[#282828] data-[state=active]:border-[#321b29] data-[state=active]:text-[#ec4899] data-[state=active]:bg-[#321b29]"
                    value="No"
                  >
                    {firstLetterCase(market?.outcome?.[1]?.title) || "No"}{" "}
                    {tab == "buy"
                      ? buyNo?.length > 0 &&
                        `${toFixedDown(100 - buyNo?.[0], 2)}¢`
                      : sellNo?.length > 0 && `${toFixedDown(sellNo?.[0], 2)}¢`}
                  </OptionsTrigger>
                </OptionsList>

                <OptionsContent value="Yes"></OptionsContent>
                <OptionsContent value="No"></OptionsContent>

                {orderType === "market" && (
                  <MarketOrder
                    activeView={activeView}
                    marketId={market?._id}
                    buyorsell={tab}
                    status={status}
                    selectedOrder={selectedOrder}
                  />
                )}

                {orderType === "limit" && (
                  <LimitOrder
                    activeView={activeView}
                    marketId={market?._id}
                    buyorsell={tab}
                    status={status}
                    selectedOrder={selectedOrder}
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
