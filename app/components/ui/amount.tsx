import * as React from "react";
import { cn } from "@/lib/utils";

export interface AmountProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  setAmount: (value: string) => void;
  amount?: number | string;
  rightLabel?: string;
}

const Amount = React.forwardRef<HTMLInputElement, AmountProps>(
  (
    {
      className,
      type = "number",
      setAmount,
      amount = 0,
      rightLabel = "USD",
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex items-center border border-input rounded-md bg-background px-3 py-2">
        <input
          type={type}
          className={cn(
            "flex-1 h-10 rounded-md bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
          placeholder={rightLabel === "¢" ? "Limit Price" : "Amount"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            if (rightLabel === "¢") {
              // For cents: no decimals, max 99
              const cleanValue = value.replace(/[^\d]/g, "");
              const limitedValue = Math.min(parseInt(cleanValue) || 0, 99);
              setAmount(limitedValue === 0 ? "" : limitedValue.toString());
            } else {
              // For USD: max 2 decimal places
              const regex = /^\d*\.?\d{0,2}$/;
              if (regex.test(value) || value === "") {
                setAmount(value);
              }
            }
          }}
          value={amount || ""}
        />
        <span className="text-foreground ml-2 text-right font-medium">
          {rightLabel}
        </span>
      </div>
    );
  }
);

Amount.displayName = "Amount";

export { Amount };
