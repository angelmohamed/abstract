import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
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
import { useEffect, useState } from "react";
import { toFixedDown } from "@/lib/roundOf";

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
    const price = parseFloat(arr.price); // Convert price to a number
    const size = parseFloat(arr.size); // Convert size to a number

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
      "border-b duration-300 ease-in-out hover:bg-[#0a0a0a]",
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
    <AccordionPrimitive.Header className="sm:text-[18px] text-[14px] flex items-center justify-between w-full mt-3">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "h-[60px] sm:text-[18px] text-[14px] w-full pr-4 pl-4 sm:pr-3 sm:pl-3 flex flex-1 items-center justify-between sm:py-4 py-2 font-medium transition-all",
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

    const [bids, setBids] = useState<any[]>([]);
    const [asks, setAsks] = useState<any[]>([]);

    useEffect(() => {
      if (activeView === "Yes") {
        setBids(orderBook?.bids?.[0] || []);
        let asks =
          orderBook?.asks?.[0]?.map((item: any) => {
            return [(100 - Number(item[0]))?.toString() || "0", item[1]];
          }) || [];
        setAsks(asks ? asks.reverse() : []);
      } else if (activeView === "No") {
        setBids(orderBook?.asks?.[0] || []);
        let asks =
          orderBook?.bids?.[0]?.map((item: any) => {
            return [(100 - Number(item[0]))?.toString() || "0", item[1]];
          }) || [];
        setAsks(asks ? asks.reverse() : []);
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

    return (
      <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)} onClick={onClickOrderBook}>
          <Tabs
            defaultValue="Yes"
            value={activeView}
            onValueChange={setActiveView}
            className="mt-4"
          >
            <TabsList className="flex border-b mb-4">
              <TabsTrigger
                value="Yes"
                className={cn(
                  "flex-1 p-2 transition-colors duration-300",
                  activeView === "Yes"
                    ? "bg-transparent text-[#27ae60]"
                    : "bg-transparent text-white hover:bg-transparent"
                )}
              >
                Trade Yes
              </TabsTrigger>
              <TabsTrigger
                value="No"
                className={cn(
                  "flex-1 p-2 transition-colors duration-300",
                  activeView === "No"
                    ? "bg-transparent text-pink-500"
                    : "bg-transparent text-white hover:bg-transparent"
                )}
              >
                Trade No
              </TabsTrigger>
            </TabsList>

            <div className="">

              {
                !asks.length && !bids.length ? (
                  <div className="flex items-center h-[320px] w-full">
                    <div className="w-full text-center">
                      No contracts available
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center h-[35px] w-full justify-between">
                      <div className="w-[30%]">
                        {activeView === "Yes" ? "Trade Yes" : "Trade No"}
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
                        <div className="h-full w-full relative">
                          {/* asks */}
                          {asks.length > 0 && (
                            asks.map((row: any, index: any) => {
                              const orderBookLength = asks.length || 0;
                              return (
                                <div
                                  key={index}
                                  className="flex items-center h-[35px] w-full justify-between duration-300 ease-in-out bg-black text-white hover:bg-[#240000]"
                                >
                                  <div className="w-[30%]">
                                    <FillAsk
                                      value={
                                        (getAccumalativeValueReverse(
                                          asks || [],
                                          orderBookLength - (index + 1)
                                        ) /
                                          100) *
                                        100
                                      }
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="text-center w-[20%] text-[#e64800]">
                                    {toFixedDown(Number(row[0]), 2) + "¢"}
                                  </div>
                                  <div className="w-[25%] text-center">
                                    {toFixedDown(Number(row[1]), 2)}
                                  </div>
                                  <div className="w-[25%] text-center">
                                    {"$" +
                                      Number(
                                        getAccumalativeValueReverse(
                                          asks || [],
                                          orderBookLength - (index + 1)
                                        ) / 100
                                      ).toFixed(2)}
                                  </div>
                                </div>
                              );
                            })
                          )}

                          <div className="absolute left-3 flex flex-col gap-10">
                            {
                              asks && asks.length > 0 && (
                                <Badge className="w-[50px] text-xs text-white bg-[#ff0000] -translate-y-7">
                                  Asks
                                </Badge>
                              )
                            }
                            {
                              bids && bids.length > 0 && (
                                <Badge className="w-[50px] z-10 text-xs text-white bg-[#00c735] -translate-y-4">
                                  Bids
                                </Badge>
                              )
                            }
                          </div>
                          
                          {
                            asks && bids && asks.length > 0 && bids.length > 0 && (
                              <div className="flex items-center h-[35px] w-full">
                              <div className="w-[30%]">Last: 38.5¢</div>
                              <div className="w-[20%] text-center">Spread: 0.5¢</div>
                              <div className="w-[25%]"></div>
                              <div className="w-[25%]"></div>
                            </div>
                            )
                          }

                          {/* bids */}
                          {bids.length > 0 && (
                            bids.map((row, index) => {
                              const orderBookLength = bids.length || 0;
                              return (
                                <div
                                  key={index}
                                  className="flex items-center h-[35px] w-full justify-between bg-black text-white duration-300 ease-in-out hover:bg-[#001202]"
                                >
                                  <div className="w-[30%]">
                                    <FillBid
                                      value={
                                        (getAccumalativeValue(bids || [], index) /
                                          15) *
                                        100
                                      }
                                      className="hover:bg-[#0a0a0a]"
                                    />
                                  </div>
                                  <div className="w-[20%] text-center text-[#27ae60]">
                                    {toFixedDown(Number(row[0]), 2) + "¢"}
                                  </div>
                                  <div className="w-[25%] text-center">
                                    {toFixedDown(Number(row[1]), 2)}
                                  </div>
                                  <div className="w-[25%] text-center">
                                    {"$" +
                                      Number(
                                        getAccumalativeValueReverse(
                                          bids || [],
                                          orderBookLength - (index + 1)
                                        ) / 100
                                      ).toFixed(2)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )
              }

            </div>
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
