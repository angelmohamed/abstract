import * as React from "react";
import { cn } from "@/lib/utils";

export interface SharesInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  setShares: (value: string) => void;
  shares?: string | number;
}

const SharesInput = React.forwardRef<HTMLInputElement, SharesInputProps>(
  ({ className, type = "number", setShares, shares = 0, ...props }, ref) => {
    return (
      <div className="flex items-center border border-input rounded-md bg-background px-3 py-2">
        <input
          type={type}
          className={cn(
            "flex-1 h-10 rounded-md bg-transparent text-base placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
            className
          )}
          ref={ref}
          {...props}
          placeholder="Amount"
          onChange={(e) => {
            setShares(e.target.value);
          }}
          value={shares}
        />
        <span className="text-muted-foreground ml-2 text-right">Shares</span>{" "}
      </div>
    );
  }
);

SharesInput.displayName = "SharesInput";

export { SharesInput };
