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
    <AccordionPrimitive.Header className="sm:text-[18px] text-[14px] flex items-center justify-between w-full">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "h-[80px] sm:text-[18px] text-[14px] w-full pr-4 pl-4 sm:pr-3 sm:pl-3 flex flex-1 items-center justify-between sm:py-4 py-2 font-medium transition-all",
          className
        )}
        {...props}
      >
        <span className="text-[16px] sm:text-[18px] flex max-w-auto">{children}</span>
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
  // orderBook?: [OrderBookData, OrderBookData];
  orderBook?: any;
  activeView: string;
  setActiveView: (value: string) => void;
  setSelectedIndex?: (index: number) => void;
  setSelectedOrderBookData?: (data: any) => void;
  index?: number;
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
      index,
      ...props
    },
    ref
  ) => {
    // const yesAskBook = orderBook?.[0]?.asks?.sort(
    //   (a, b) => Number(b.price) - Number(a.price)
    // );
    // const yesAskBookHighest = getAccumalativeTotal(yesAskBook);

    // const yesBidBook = orderBook?.[0]?.bids?.sort(
    //   (a, b) => Number(b.price) - Number(a.price)
    // );
    // const yesBidBookHighest = getAccumalativeTotal(yesBidBook);

    // const noAskBook = orderBook?.[1]?.asks?.sort(
    //   (a, b) => Number(b.price) - Number(a.price)
    // );
    // const noAskBookHighest = getAccumalativeTotal(noAskBook);

    // const noBidBook = orderBook?.[1]?.bids?.sort(
    //   (a, b) => Number(b.price) - Number(a.price)
    // );
    // const noBidBookHighest = getAccumalativeTotal(noBidBook);

    // const selectedOrderBook: [OrderBookItem[] | undefined, OrderBookItem[] | undefined, number, number] =
    //   activeView === "Yes"
    //     ? [yesAskBook, yesBidBook, yesAskBookHighest, yesBidBookHighest]
    //     : [noAskBook, noBidBook, noAskBookHighest, noBidBookHighest];

    const selectedOrderBook: [any[], any[], number, number] = [[[1,1], [1,1]], [[1,1], [1,1]], 0, 0];
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
        setBids(orderBook?.bids?.[0] || [])
        let asks = orderBook?.asks?.[0]?.map((item:any) => {
          return [(100 - Number(item[0]))?.toString() || "0", item[1]];
        }) || []
        setAsks(asks ? asks.reverse() : []);
      }
      else if (activeView === "No") {
        setBids(orderBook?.asks?.[0] || []);
        let asks = orderBook?.bids?.[0]?.map((item:any) => {
          return [(100 - Number(item[0]))?.toString() || "0", item[1]];
        }) || []
        setAsks(asks ? asks.reverse() : []);
      }
    }, [activeView,orderBook]);
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
                    ? "bg-transparent text-[#7DFDFE]"
                    : "bg-transparent text-white hover:bg-transparent"
                )}
              >
                Yes
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
                No
              </TabsTrigger>
            </TabsList>
            {/* bids */}
            <div className="w-full border-collapse rounded-lg">
              <div className="relative">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="text-black p-2 border-b pr-0 mr-0 border-gray-700">
                        Progress
                      </th>
                      <th className="p-2 pl-1 ml-0 border-b border-gray-700">
                        Price
                      </th>
                      <th className="p-2 border-b border-gray-700">
                        Contracts
                      </th>
                      <th className="p-2 border-b border-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asks?.length > 0 ? (
                      asks?.map((row:any, index:any) => {
                        // 确保 selectedOrderBook[0] 存在且有长度
                        const orderBookLength = asks?.length || 0;
                        // console.log()
                        console.log(orderBookLength, "orderBookLength")
                        return (
                        <tr
                          key={index}
                          className="duration-300 ease-in-out bg-black text-white hover:bg-[#0a0a0a]"
                        >
                          <td className="p-0 pr-0 mr-0 w-[60%]">
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
                          </td>
                          <td className="p-2 pl-1 ml-0 w-[40%]">
                          {(Number(row[0])).toFixed(1) + "¢"}
                          </td>
                          <td className="p-2">{Number((row[1])).toFixed(2)}</td>

                          <td className="p-2">
                            {"$" +
                              Number(
                                getAccumalativeValueReverse(
                                  asks || [],
                                  orderBookLength - (index + 1)
                                ) / 100
                              ).toFixed(2)}
                          </td>
                        </tr>
                        );
                      })
                      ) : (
                        <tr className="bg-black text-white">
                          <td colSpan={4} className="p-2 text-center">
                            No contracts available
                          </td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>

                <div className="absolute left-3 flex flex-col gap-10">
                  <Badge className="w-[50px] text-xs text-white bg-[#ff0000] -translate-y-7">
                    Asks
                  </Badge>
                  <Badge className="w-[50px] z-10 text-xs text-white bg-[#00c735] -translate-y-4">
                    Bids
                  </Badge>
                </div>
                    {/* asks */}
                <table className="w-full text-left mt-0">
                  <thead>
                    <tr className="bg-black text-transparent">
                      <th className="text-black p-2 border-b pr-0 mr-0 border-gray-700">
                        Progress
                      </th>
                      <th className="p-2 pl-1 ml-0 border-b border-gray-700">
                        Price
                      </th>
                      <th className="p-2 border-b border-gray-700">
                        Contracts
                      </th>
                      <th className="p-2 border-b border-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids?.length > 0 ? (
                        bids?.map((row, index) => {
                          const orderBookLength = bids?.length || 0;
                          return (
                          <tr
                            key={index}
                            className="bg-black text-white hover:bg-[#0a0a0a] duration-300 ease-in-out"
                          >
                            <td className="hover:bg-[#0a0a0a] p-0 pr-0 mr-0 w-[60%]">
                              <FillBid
                                value={
                                  (getAccumalativeValue(
                                    bids || [],
                                    index
                                  ) /
                                    15) *
                                  100
                                }
                                className="hover:bg-[#0a0a0a]"
                              />
                            </td>
                            <td className="p-2 pl-1 ml-0 w-[40%]">
                            {(Number(row[0])).toFixed(1) + "¢"}
                            </td>
                            <td className="p-2">{Number((row[1])).toFixed(2)}</td>
                            <td className="p-2">
                              {/* {"$" +
                                Number(
                                  getAccumalativeValue(bids || [], index)
                                ).toFixed(2)} */}
                              {"$" +
                                Number(
                                  getAccumalativeValueReverse(
                                    bids || [],
                                    orderBookLength - (index + 1)
                                  ) / 100
                                ).toFixed(2)}
                            </td>
                          </tr>
                        )})
                      ) : (
                        <tr className="bg-black text-white">
                          <td colSpan={4} className="p-2 text-center">
                            No contracts available
                          </td>
                        </tr>
                      )
                  }
                  </tbody>
                </table>
              </div>
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
