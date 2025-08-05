import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Clock5, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { FillAsk } from "@/app/components/ui/fillAsk";
import { FillBid } from "@/app/components/ui/fillBid";
import { Badge } from "@/app/components/ui/badge";
import {
  decimalToPercentage,
  getAccumalativeValue,
  getAccumalativeValueReverse,
  toTwoDecimal,
} from "@/utils/helpers";
import { useContext, useEffect, useState } from "react";
import { toFixedDown } from "@/lib/roundOf";
import { getOpenOrdersByEvtId } from "@/services/user";
import { OpenOrderDialog } from "../customComponents/OpenOrderDialog";
import { SocketContext } from "@/config/socketConnectivity";
import store from "@/store";
import { capitalize } from "@/lib/stringCase";
import Graph from "../customComponents/Grpah";
import { useParams } from "next/navigation";
import { getEventById } from "@/services/market";
import OrderbookChart from "../customComponents/OrderbookChart";

interface OrderBookItem {
  price: string;
  size: string;
  [key: string]: any;
}

interface OrderBookData {
  asks: OrderBookItem[];
  bids: OrderBookItem[];
  [key: string]: any;
}

function getAccumalativeTotal(arr: OrderBookItem[] | undefined): number {
  if (!Array.isArray(arr)) {
    return 0;
  }

  return arr.reduce((total, arr) => {
    const price = parseFloat(arr[0]); // Convert price to a number
    const size = parseFloat(arr[1]); // Convert size to a number

    if (isNaN(price) || isNaN(size)) {
      throw new Error("Price and size must be valid numbers.");
    }

    const product = price * size; // Calculate size * price
    return total + product; // Return the higher value
  }, 0);
}

// Accordion Root
const OrderbookAccordion = AccordionPrimitive.Root;

// Accordion Item Component
const OrderbookAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border border-muted rounded-xl mb-2 duration-300 ease-in-out hover:bg-[#0a0a0a]",
      className
    )}
    {...props}
  />
));
OrderbookAccordionItem.displayName = "AccordionItem";

// Accordion Trigger Component
const OrderbookAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="sm:text-[18px] text-[14px] flex items-center justify-between w-full">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "h-[68px] sm:h-[80px] sm:text-[18px] text-[14px] w-full pr-4 pl-4 sm:pr-3 sm:pl-4 flex flex-1 items-center justify-between sm:py-4 py-2 font-medium transition-all cursor-pointer",
          className
        )}
        {...props}
      >
        <span className="text-[16px] sm:text-[18px] flex max-w-auto">
          {children}
        </span>
        <div className="flex-1" />
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
OrderbookAccordionTrigger.displayName = "AccordionTrigger";

interface OrderbookAccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  orderBook?: any;
  activeView: string;
  setActiveView: (value: string) => void;
  setSelectedIndex?: (index: number) => void;
  setSelectedOrderBookData?: (data: any) => void;
  index?: number;
  isOpen?: boolean;
  selectedMarket: {
    last: number | null;
    _id: string;
    outcome: any;
    odd: any;
  },
  setSelectedOrder: (data: any) => void;
  forecast: boolean,
  forecastGraph: string,
  setForecastGraph: (s: boolean) => void,
  interval?: string,
}

// Accordion Content Component
const OrderbookAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  OrderbookAccordionContentProps
>(
  (
    {
      className,
      children,
      orderBook,
      activeView,
      setActiveView,
      setSelectedIndex,
      setSelectedOrderBookData,
      isOpen = true,
      index,
      selectedMarket,
      setSelectedOrder,
      forecast,
      forecastGraph,
      setForecastGraph,
      interval = "1d",
      ...props
    },
    ref
  ) => {
    const onClickOrderBook = () => {
      // if (setSelectedOrderBookData) {
      //   setSelectedOrderBookData(orderBook);
      // }
      // if (setSelectedIndex && typeof index === 'number') {
      //   setSelectedIndex(index);
      // }
    };
    const param = useParams();
    const id = param.id;
    const [bids, setBids] = useState<any[]>([]);
    const [asks, setAsks] = useState<any[]>([]);
    const [openOrders, setOpenOrders] = useState<any[]>([]);
    const [openOrderDialog, setOpenOrderDialog] = useState<boolean>(false);
    const [selectedOpenOrder, setSelectedOpenOrder] = useState<any>(null);
    const [askBookHighest, setAskBookHighest] = useState<number>(0);
    const [bidBookHighest, setBidBookHighest] = useState<number>(0);
    const [markets, setMarkets] = useState([]);
    
    // Add proper interval state management
    const [chartInterval, setChartInterval] = useState<string>(interval || "1d");
    
    // Update chartInterval when interval prop changes
    useEffect(() => {
      if (interval) {
        setChartInterval(interval);
      }
    }, [interval]);
    
    type ChartDataItem = { timestamp: string; asset1: number };
    const randomChartData: ChartDataItem[] = React.useMemo(() => {
      const arr: ChartDataItem[] = [];
      for (let i = 0; i < 20; i++) {
        arr.push({ timestamp: `T${i+1}`, asset1: Math.round(Math.random() * 100) });
      }
      return arr;
    }, []);

    const socketContext = useContext(SocketContext);

    const calcSpread = React.useCallback((bids: any[][] = [], asks: any[][] = []): string => {
      const b = bids.map((b) => parseFloat(b[0])).filter((n) => !isNaN(n));
      const a = asks.map((a) => parseFloat(a[0])).filter((n) => !isNaN(n));

      const highestBid = b.length ? Math.max(...b) : null;
      const lowestAsk = a.length ? Math.min(...a) : null;
      
      if (highestBid !== null && lowestAsk !== null) {
        return `${toFixedDown(lowestAsk - highestBid, 2)}¢`;
      }
    
      return '--';
    }, [bids, asks]);

    useEffect(() => {
      const descending = (a: any, b: any) => Number(b[0]) - Number(a[0]);
      const ascending = (a: any, b: any) => Number(a[0]) - Number(b[0]);
      // console.log(orderBook, "orderBook");

      if (activeView === "Yes") {
        const sortedBids = (orderBook?.bids?.[0] || []).sort(descending);
        setBids(sortedBids);
        setBidBookHighest(getAccumalativeTotal(sortedBids));
        let asks =
          orderBook?.asks?.[0]?.map((item: any) => {
            return [(100 - Number(item[0]))?.toString() || "0", item[1]];
          }) || [];
        const sortedAsks = asks.sort(ascending);
        setAsks(sortedAsks ? sortedAsks.reverse(): []);
        setAskBookHighest(getAccumalativeTotal(sortedAsks))
      } else if (activeView === "No") {
        const sortedBids = (orderBook?.asks?.[0] || []).sort(descending);
        setBids(sortedBids);
        setBidBookHighest(getAccumalativeTotal(sortedBids))
        let asks =
          orderBook?.bids?.[0]?.map((item: any) => {
            return [(100 - Number(item[0]))?.toString() || "0", item[1]];
          }) || [];
        const sortedAsks = asks.sort(ascending);
        setAsks(sortedAsks ? sortedAsks.reverse() : []);
        setAskBookHighest(getAccumalativeTotal(sortedAsks))
      }
    }, [activeView, orderBook]);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;
      requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        if (container) {
          const asksCount = asks.length;
          const rowHeight = 35;
          const scrollTop = Math.max(
            0,
            asksCount * rowHeight - container.clientHeight / 2
          );
          container.scrollTop = scrollTop;
        }
      });
    }, [asks, bids, activeView, isOpen]);

    const getOpenOrders = async () => {
      try {
        const respData = await getOpenOrdersByEvtId({
          id: selectedMarket?._id,
        });
        if (respData.success) {
          setOpenOrders(respData.result);
        } else {
          setOpenOrders([]);
        }
      } catch (error) {
        console.log(error, "error");
      }
    };

    useEffect(() => {
      getOpenOrders();
    }, [selectedMarket]);

    const onOrderCancel = async (orderId: any,success: any) => {
      try {
        if(success) {
          let orderIndex = openOrders.findIndex((order: any) => order._id == orderId);
          if(orderIndex != -1) {
            let newOpenOrders = [...openOrders];
            newOpenOrders.splice(orderIndex, 1);
            // setOpenOrders(newOpenOrders);
            let selOpenOrderData = selectedOpenOrder.filter((order: any) => order._id != orderId);
            if(selOpenOrderData.length > 0) {
              setSelectedOpenOrder(selOpenOrderData)
            } else {
              setSelectedOpenOrder(null)
              setOpenOrderDialog(false)
            }
          }
        } 
      } catch (error) {
        console.log(error, "error");
      }
    }
    useEffect(() => {
      const socket = socketContext?.socket;
      if (!socket) return;
  
      const handleOpenOrders = (result: any) => {
        const resData = JSON.parse(result);
        // price quantity side eventid marketid groupItemTitle userSide action price execQty timeInForce createdAt _id
        if (resData.marketId._id !== selectedMarket?._id) return;
        // if(resData.userId !== user?._id) return;
        setOpenOrders((prev: any) => {
              const findOrder = prev.find(order => order._id === resData._id)
              if(findOrder){ 
                  if (["open", "pending"].includes(resData.status)) {
                    findOrder.price = resData.price
                    findOrder.quantity = resData.quantity
                    findOrder.execQty = resData.execQty
                    findOrder.side = resData.side
                    findOrder.createdAt = resData.createdAt
                    findOrder.action = resData.action
                    findOrder.userSide = resData.userSide
                    findOrder.timeInForce = resData.timeInForce
                    // findOrder.status = resData.status
                    return prev;
                  } else if (["completed", "cancelled", "expired"].includes(resData.status)) {
                      let updatedOpenOrders = prev.filter(order => order._id !== resData._id)
                      return updatedOpenOrders
                  }
              } else {
                  const newOrder = {
                    _id: resData._id,
                    price: resData.price,
                    quantity: resData.quantity,
                    execQty: resData.execQty,
                    side: resData.side,
                    createdAt: resData.createdAt,
                    action: resData.action,
                    userSide: resData.userSide,
                    timeInForce: resData.timeInForce,
                    marketId: {
                      _id: resData.marketId._id,
                      groupItemTitle: resData.marketId.groupItemTitle,
                      last: resData.marketId.last,
                      outcome: resData.marketId.outcome
                    }
                  }
                  return [newOrder, ...prev]
              }
        })
      }

      socket.on("order-update", handleOpenOrders);
  
      return () => {
        socket.off("order-update");
      };
    
    }, [socketContext?.socket]);
  
    useEffect(() => {
      if (!id) {
        return;
      }
  
      const fetchEvents = async () => {
        try {
          let { success, result } = await getEventById({ id: id });
          if (success) {
            if (result?.marketId && result?.marketId.length > 0) {
              setMarkets(
                result.marketId.filter((market) =>
                  ["active", "closed", "resolved"].includes(market.status)
                )
              );
            }
          }
        } catch (error) {}
      };
      fetchEvents();
    }, [id]);
    console.log(activeView, forecastGraph, "forecastGraph");
    return (
      <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)} onClick={onClickOrderBook}>
          <Tabs
            defaultValue="Yes"
            value={forecastGraph ? "Graph" : activeView}
            onValueChange={(val) => {
              if (val === "Graph") {
                setForecastGraph(true);
              } else {
                setForecastGraph(false);
                setActiveView(val);
              }
            }}
            // className="mt-4"
          >
            <TabsList className="flex justify-start w-1/4 min-w-[150px]">
              <TabsTrigger
                value="Yes"
                className="flex-1 px-2 py-2 transition-all duration-300 border-b-2 border-transparent"
              >
                Trade {capitalize(selectedMarket?.outcome?.[0]?.title || "Yes")}
              </TabsTrigger>
              <TabsTrigger
                value="No"
                className="flex-1 px-2 py-2 transition-all duration-300 border-b-2 border-transparent"
              >
                Trade {capitalize(selectedMarket?.outcome?.[1]?.title || "No")}
              </TabsTrigger>
              {
                forecast && <TabsTrigger
                value="Graph"
                className={cn(
                  "flex-1 p-2 transition-colors duration-300",
                  forecastGraph
                    ? "bg-transparent text-pink-500"
                    : "bg-transparent text-white hover:bg-transparent"
                )}
              >
                Graph
              </TabsTrigger>
              }
            </TabsList>
            <hr className="border-t border-[#222] m-0" />
             {
              !forecastGraph ? (
                <div className="">
                  {!asks.length && !bids.length ? (
                    <div className="flex items-center h-[320px] w-full">
                      <div className="w-full text-center">
                        No contracts available
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center h-[35px] w-full justify-between">
                        <div className="w-[30%] p-3">
                          {activeView === "Yes" ? `Trade ${capitalize(selectedMarket?.outcome?.[0]?.title) || "Yes"}` : `Trade ${capitalize(selectedMarket?.outcome?.[1]?.title) || "No"}`}
                        </div>
                        <div className="w-[20%] text-center">Price</div>
                        <div className="w-[25%] text-center">Shares</div>
                        <div className="w-[25%] text-center">Total</div>
                      </div>
                      <div className="w-full overflow-hidden h-[fit-content]">
                        <div
                          className="h-[320px] w-full overflow-auto"
                          ref={scrollContainerRef}
                        >
                          <div
                            className={
                              asks.length + bids.length <= 8
                                ? "h-full w-full relative flex flex-col justify-center items-center"
                                : "h-full w-full relative"
                            }
                          >
                            {/* asks */}
                            <div className="relative w-full">
                              {asks.length > 0 &&
                                asks.map((row: any, index: any) => {
                                  const orderBookLength = asks.length || 0;
                                  const openOrder = openOrders?.filter((order: any) => (100 - Number(order.price)) == row[0] );
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center h-[35px] w-full justify-between duration-300 ease-in-out bg-black text-white hover:bg-[#240000] z-20 relative cursor-pointer"
                                      onClick={() => setSelectedOrder({ 
                                        side: activeView, 
                                        row, 
                                        bidOrAsk: "ask", 
                                        ordCost: Number(
                                          getAccumalativeValueReverse(
                                            asks || [],
                                            orderBookLength - (index + 1)
                                          ) / 100
                                        )?.toFixed(2) 
                                      })}
                                    >
                                      <div className="w-[30%]">
                                        <FillAsk
                                          value={
                                            (getAccumalativeValueReverse(
                                              asks || [],
                                              orderBookLength - (index + 1)
                                            ) /
                                            askBookHighest) *
                                            100
                                          }
                                          className="w-full"
                                        />
                                      </div>
                                      <div className="text-center w-[20%]">
                                        {toFixedDown(Number(row[0]), 2) + "¢"} 
                                      </div>
                                      <div className="w-[25%] text-center flex items-center justify-center gap-2">
                                        {toFixedDown(Number(row[1]), 2)}
                                        {openOrder?.length > 0 && (
                                          <div className="flex items-center gap-2" onClick={() => {setOpenOrderDialog(true); setSelectedOpenOrder(openOrder)}}>
                                            <Clock5 className="w-4 h-4" />
                                            {toFixedDown(openOrder.reduce((acc, curr) => acc + (curr.quantity - curr.execQty), 0), 2)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-[25%] text-center">
                                        {"$" +
                                          Number(
                                            getAccumalativeValueReverse(
                                              asks || [],
                                              orderBookLength - (index + 1)
                                            ) / 100
                                          )?.toFixed(2)}
                                      </div>
                                    </div>
                                  );
                                })}
                              {/* Asks badge */}
                              {asks.length > 0 && (
                                <div className="flex w-full">
                                  <Badge className="w-[50px] text-xs text-white bg-[#ff0000] mb-1 absolute bottom-0 left-5 z-30">
                                    Asks
                                  </Badge>
                                </div>
                              )}{" "}
                            </div>
    
                            {asks && bids && asks.length > 0 && bids.length > 0 && (
                              <div className="flex items-center h-[35px] w-full p-3">
                                <div className="w-[30%]">Last: 
                                  {selectedMarket?.last ? (
                                    activeView == "Yes" ? selectedMarket?.last || 0 : 100 - (selectedMarket?.last || 0)
                                  ) : "--"}
                                ¢</div>
                                <div className="w-[20%] text-center">
                                  Spread: {calcSpread(bids, asks)}
                                </div>
                                <div className="w-[25%]"></div>
                                <div className="w-[25%]"></div>
                              </div>
                            )}
    
                            {/* Bids badge */}
                            <div className="relative w-full">
                              {bids.length > 0 && (
                                <div className="flex w-full">
                                  <Badge className="w-[50px] text-xs text-white bg-[#00c735] mt-1 mb-1 absolute top-0 left-5 z-30">
                                    Bids
                                  </Badge>
                                </div>
                              )}
    
                              {/* bids */}
                              {bids.length > 0 &&
                                bids.map((row, index) => {
                                  const orderBookLength = bids.length || 0;
                                  const openOrder = openOrders?.filter((order: any) => (order.price == row[0] && order.side == activeView?.toLowerCase()));
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center h-[35px] w-full justify-between bg-black text-white duration-300 ease-in-out hover:bg-[#001202] z-20 relative cursor-pointer"
                                      onClick={() => setSelectedOrder({ 
                                        side: activeView, 
                                        row, 
                                        bidOrAsk: "bid", 
                                        ordCost: Number(
                                          getAccumalativeValue(
                                            asks || [],
                                            orderBookLength - (index + 1)
                                          ) / 100
                                        )?.toFixed(2) 
                                      })}
                                    >
                                      <div className="w-[30%]">
                                        <FillBid
                                          value={
                                            (getAccumalativeValue(
                                              bids || [],
                                              index
                                            ) /
                                              bidBookHighest) *
                                            100
                                          }
                                          className="hover:bg-[#0a0a0a]"
                                        />
                                      </div>
                                      <div className="w-[20%] text-center">
                                        {toFixedDown(Number(row[0]), 2) + "¢"} 
                                      </div>
                                      <div className="w-[25%] text-center flex items-center justify-center gap-2">
                                        {toFixedDown(Number(row[1]), 2)}
                                        {openOrder?.length > 0 && (
                                          <div className="flex items-center gap-2" onClick={() => {setOpenOrderDialog(true); setSelectedOpenOrder(openOrder)}} style={{cursor: 'pointer'}}>
                                            <Clock5 className="w-4 h-4" />
                                            {toFixedDown(openOrder.reduce((acc, curr) => acc + (curr.quantity - curr.execQty), 0), 2)}
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-[25%] text-center">
                                        {"$" +
                                          Number(
                                            getAccumalativeValue(
                                              bids || [],
                                              index
                                            ) / 100
                                          )?.toFixed(2)
                                        }
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) :
              (
                <div className="w-full border-collapse rounded-xl px-4 pt-0" style={{ backgroundColor: 'transparent' }}>
                  <OrderbookChart id={id} selectedMarket={selectedMarket} title={selectedMarket?.odd} market={markets} interval={chartInterval} setInterval={setChartInterval} customData={randomChartData} />
                </div>
              )
             }

            <OpenOrderDialog 
              openOrderDialog={openOrderDialog} 
              setOpenOrderDialog={setOpenOrderDialog} 
              openOrderData={selectedOpenOrder} 
              onOrderCancel={onOrderCancel}
            />
          </Tabs>
        </div>
      </AccordionPrimitive.Content>
    );
  }
);

OrderbookAccordionContent.displayName = "AccordionContent";

export {
  OrderbookAccordion,
  OrderbookAccordionItem,
  OrderbookAccordionTrigger,
  OrderbookAccordionContent,
};
