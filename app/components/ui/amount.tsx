import * as React from "react";
import { cn } from "@/lib/utils";

export interface AmountProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  setAmount: (value: string) => void;
  amount?: number | string;
}

const Amount = React.forwardRef<HTMLInputElement, AmountProps>(
  ({ className, type = "number", setAmount, amount = 0, ...props }, ref) => {
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
          placeholder="Amount" // "Amount" is now a placeholder instead of a span
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setAmount(e.target.value);
          }}
          value={amount}
        />
        <span className="text-muted-foreground ml-2 text-right">USD</span>{" "}
        {/* Move USD to the right */}
      </div>
    );
  }
);

Amount.displayName = "Amount";

export { Amount };