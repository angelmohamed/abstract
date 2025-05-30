import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FillAsk } from "@/app/components/ui/fillAsk";
import { FillBid } from "@/app/components/ui/fillBid";
import { Badge } from "@/app/components/ui/badge";
import { decimalToPercentage } from "@/utils/helpers";

// 定义订单簿项的接口
interface OrderBookItem {
  fill: string;
  price: string;
  contracts: string;
  total: string;
}

// Order book data
const yesAskBook: OrderBookItem[] = [
  { fill: "100", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "80", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "60", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "40", price: "3,150", contracts: "8", total: "25,200" },
  { fill: "20", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "14", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "8", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "4", price: "3,100", contracts: "12", total: "37,200" },
];

const yesBidBook: OrderBookItem[] = [
  { fill: "6", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "7", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "13", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "27", price: "3,150", contracts: "8", total: "25,200" },
  { fill: "35", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "55", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "80", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "100", price: "3,100", contracts: "12", total: "37,200" },
];

const noAskBook: OrderBookItem[] = [
  { fill: "100", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "90", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "56", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "46", price: "3,150", contracts: "8", total: "25,200" },
  { fill: "23", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "12", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "10", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "2", price: "3,100", contracts: "12", total: "37,200" },
];

const noBidBook: OrderBookItem[] = [
  { fill: "9", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "10", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "13", price: "3,200", contracts: "5", total: "16,000" },
  { fill: "22", price: "3,150", contracts: "8", total: "25,200" },
  { fill: "39", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "50", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "84", price: "3,100", contracts: "12", total: "37,200" },
  { fill: "100", price: "3,100", contracts: "12", total: "37,200" },
];

const Accordion = AccordionPrimitive.Root;

// 定义选择上下文的接口
interface SelectionContextType {
  activeMarket: string | null;
  activeSelection: string | null;
  setSelection: (marketId: string | null, value: string | null) => void;
}

// Updated context to include active market and selection
const SelectionContext = React.createContext<SelectionContextType>({
  activeMarket: null,
  activeSelection: null,
  setSelection: () => {},
});

interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  className?: string;
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>, 
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b duration-300 ease-in-out hover:bg-[#0a0a0a]",
      className
    )} // Add hover effect for the entire item
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const useSelection = (): SelectionContextType => {
  const context = React.useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
};

interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  className?: string;
  marketId: string;
  outcomePrice?: number;
  setSelectedOrderBookData: (orderBook: OrderBookItem[][]) => void;
  orderBook: OrderBookItem[][];
  setSelectedIndex: (index: number) => void;
  index: number;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      className,
      children,
      marketId,
      outcomePrice,
      setSelectedOrderBookData,
      orderBook,
      setSelectedIndex,
      index,
      ...props
    },
    ref
  ) => {
    const { activeMarket, activeSelection, setSelection } = useSelection();
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const handleSelection = (value: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event from bubbling
      setSelectedOrderBookData(orderBook);
      setSelectedIndex(index);
      // Case 1: Clicking the same button in the same market - deactivate and close accordion
      if (activeMarket === marketId && activeSelection === value) {
        setSelection(null, null);
        if (triggerRef.current) {
          const state = triggerRef.current.getAttribute("data-state");
          if (state === "open") {
            triggerRef.current.click(); // Close the accordion
          }
        }
      }
      // Case 2: Switching from yes to no or vice versa in the same market - don't close accordion
      else if (activeMarket === marketId && activeSelection !== value) {
        setSelection(marketId, value);
      }
      // Case 3: Selecting a button in a different market
      else {
        setSelection(marketId, value);
        // Force open the accordion if it's closed
        if (triggerRef.current) {
          const state = triggerRef.current.getAttribute("data-state");
          if (state === "closed") {
            triggerRef.current.click();
          }
        }
      }
    };

    const isActive = activeMarket === marketId;

    return (
      <AccordionPrimitive.Header className="flex items-center justify-between w-full mt-3">
        <AccordionPrimitive.Trigger
          onClick={(e) => handleSelection("yes", e)}
          ref={(node) => {
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
            triggerRef.current = node;
          }}
          className={cn(
            "h-[60px] w-full pr-3 pl-3 flex flex-1 items-center justify-between py-4 font-medium transition-all",
            className
          )}
          {...props}
        >
          <span className="text-xl flex max-w-auto">{children}</span>
          <div className="flex-1" /> {/* This will push the "25%" to the right */}
          <div className="text-l text-right pr-3"> {/* Add padding for spacing */}
            <span className="text-right">
              {outcomePrice && decimalToPercentage(outcomePrice) + "%"}
            </span>
          </div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  }
);

AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  className?: string;
  marketId: string;
}

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(
  ({ className, children, marketId, ...props }, ref) => {
    const { activeMarket, activeSelection } = useSelection();
    const isActive = activeMarket === marketId;
    const selection = isActive ? activeSelection : null;

    const selectedOrderBook =
      selection === "yes"
        ? [yesAskBook, yesBidBook]
        : selection === "no"
        ? [noAskBook, noBidBook]
        : [[] as OrderBookItem[], [] as OrderBookItem[]]; // Empty order book when no selection

    return (
      <AccordionPrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>
          <Tabs defaultValue="orderbook" className="mt-4">
            <TabsList className="flex border-b">
              <TabsTrigger value="orderbook">Order Book</TabsTrigger>
              <TabsTrigger value="graph">Graph</TabsTrigger>
            </TabsList>
            <TabsContent value="orderbook" className="mt-1 rounded-lg">
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
                      {selectedOrderBook[0].map((row, index) => (
                        <tr
                          key={index}
                          className=" duration-300 ease-in-out bg-black text-white hover:bg-[#0a0a0a]"
                        >
                          <td className="p-0 pr-0 mr-0 w-[60%]">
                            <FillAsk value={row.fill} className="w-full" />
                          </td>
                          <td className="p-2 pl-1 ml-0 w-[40%]">{row.price}</td>
                          <td className="p-2">{row.contracts}</td>
                          <td className="p-2">{row.total}</td>
                        </tr>
                      ))}
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
                      {selectedOrderBook[1].map((row, index) => (
                        <tr
                          key={index}
                          className="bg-black text-white hover:bg-[#0a0a0a] duration-300 ease-in-out"
                        >
                          <td className="hover:bg-[#0a0a0a] p-0 pr-0 mr-0 w-[60%]">
                            <FillBid
                              value={row.fill}
                              className="hover:bg-[#0a0a0a]"
                            />
                          </td>
                          <td className="p-2 pl-1 ml-0 w-[40%]">{row.price}</td>
                          <td className="p-2">{row.contracts}</td>
                          <td className="p-2">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="graph" className="mt-2">
              {/* Graph content here */}
            </TabsContent>
          </Tabs>
        </div>
      </AccordionPrimitive.Content>
    );
  }
);

AccordionContent.displayName = "AccordionContent";

interface ProviderProps {
  children: React.ReactNode;
}

const SelectionProvider: React.FC<ProviderProps> = ({ children }) => {
  const [activeMarket, setActiveMarket] = React.useState<string | null>(null);
  const [activeSelection, setActiveSelection] = React.useState<string | null>(null);

  const setSelection = (marketId: string | null, value: string | null) => {
    setActiveMarket(marketId);
    setActiveSelection(value);
  };

  return (
    <SelectionContext.Provider
      value={{
        activeMarket,
        activeSelection,
        setSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

const withSelection = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  return function WithSelectionComponent(props: P) {
    return (
      <SelectionProvider>
        <Component {...props} />
      </SelectionProvider>
    );
  };
};

const AccordionWithSelection = withSelection(Accordion);

export {
  AccordionWithSelection as Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};
