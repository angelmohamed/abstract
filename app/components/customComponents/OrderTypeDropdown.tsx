import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface OrderTypeProps {
  orderType: string;
  setOrderType: (value: string) => void;
}

const options = [
  { value: "limit", label: "Limit Order" },
  { value: "market", label: "Market Order" },
];

const OrderTypeDropdown: React.FC<OrderTypeProps> = (props) => {
  const { orderType, setOrderType } = props;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 p-2 text-[14px] font-normal"
          aria-label="Customise options"
        >
          <span>
            {orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order
          </span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
          {options.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className="text-[14px] p-2 cursor-pointer hover:bg-[#100f0f]"
              onSelect={() => setOrderType(option.value)}
            >
              <span>{option.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default React.memo(OrderTypeDropdown);
