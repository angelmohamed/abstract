import React, { useContext, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "radix-ui";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { firstLetterCase } from "@/lib/stringCase";

import {
  Card,
  CardContent,
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
}) {
  const onTabChange = (value) => {
    setActiveView(value);
  };

  const buyYes = selectedOrderBookData?.asks?.[0]?.reverse()?.[0] || [];
  const buyNo = selectedOrderBookData?.bids?.[0]?.reverse()?.[0] || [];
  const sellYes = selectedOrderBookData?.bids?.[0]?.[0] || [];
  const sellNo = selectedOrderBookData?.asks?.[0]?.[0] || [];
  const socketContext = useContext(SocketContext)

  const [orderType, setOrderType] = React.useState("limit");
  const [showCustomDialog, setShowCustomDialog] = React.useState(false);

  const [tab, setTab] = React.useState("buy");
  const [positions, setPositions] = React.useState({});
  // Calculate days left when customDate changes

  const fetchPositions = async () => {
    try {
      const { success, result } = await getPositionsByEvtId({ id: market?._id });
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
    let socket = socketContext?.socket
    if (!socket) return
    const handlePositions = (result) => {
      const resData = JSON.parse(result)
      setPositions((prev) => {
        return {
          ...prev,
          filled: resData?.filled,
          quantity: resData?.quantity,
          side: resData?.side,
        }
      })
      
    }
    socket.on("pos-update", handlePositions)
    return () => {
      socket.off("pos-update", handlePositions)
    }
  }, [socketContext])

  return (
    <Card className="w-[100%] trading_card" style={{ backgroundColor: "#161616" }}>
      <div className="w-[100%]">
        <CardHeader className="pb-3">
          <CardTitle style={{ lineHeight: "1.5" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="text-[16px]"
                style={{ paddingLeft: "8px", marginRight: "0px" }}
              >
                {market?.question}
              </div>
            </div>
          </CardTitle>
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
            {!isEmptyObject(positions) && <h1 className="pt-2" style={{color: positions?.side === "yes" ? "#27ae60" : "#e64800"}}>{capitalize(positions?.side)} &middot; {toFixedDown(positions?.quantity, 2)}  ({positions?.filled?.[0]?.price?.toFixed(2)}¢) owned ⓘ</h1>}
            <div className="pt-2">
              <Options
                defaultValue={activeView}
                value={activeView}
                onValueChange={onTabChange}
                className="w-full"
              >
                <OptionsList className="grid w-full grid-cols-2 gap-2">
                  <OptionsTrigger
                    className=" border-transparent hover:bg-[#282828] data-[state=active]:bg-[#1f3e2c] data-[state=active]:text-[#27ae60] data-[state=active]:border-[#1f3e2c]"
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
                    className="hover:bg-[#282828] data-[state=active]:border-[#362020] data-[state=active]:text-[#e64800] data-[state=active]:bg-[#362020]"
                    value="No"
                  >
                    {firstLetterCase(market?.outcome?.[1]?.title) || "No"}{" "}
                    {tab == "buy"
                      ? buyNo?.length > 0 &&
                        `${toFixedDown(100 - buyNo?.[0], 2)}¢`
                      : sellNo?.length > 0 &&
                        `${toFixedDown(sellNo?.[0], 2)}¢`}
                  </OptionsTrigger>
                </OptionsList>

                <OptionsContent value="Yes"></OptionsContent>
                <OptionsContent value="No"></OptionsContent>

                {orderType === "market" && (
                  <MarketOrder
                    activeView={activeView}
                    marketId={market?._id}
                    buyorsell={tab}
                  />
                )}

                {orderType === "limit" && (
                  <LimitOrder
                    activeView={activeView}
                    marketId={market?._id}
                    buyorsell={tab}
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
