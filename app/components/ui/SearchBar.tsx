import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* Search Icon */}
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground z-20">
          <Search className="h-4 w-4" />
        </span>
        {/* Input Field */}
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-[#0f0f0f] pl-10 pr-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-white focus:border disabled:cursor-not-allowed disabled:opacity-50 md:text-sm relative z-10"
            )}
            ref={ref}
            {...props}
          />
          {/* Pulsating white border animation - focus only */}
          <div className="absolute inset-0 rounded-md z-20 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-md border border-white animate-border-glow"></div>
            <div className="absolute inset-0 rounded-md">
              {/* Flowing lines */}
              <div
                className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-line-flow"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-white to-transparent animate-line-flow-vertical"
                style={{ animationDelay: "0.7s" }}
              ></div>
              <div
                className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-line-flow"
                style={{ animationDelay: "1.2s" }}
              ></div>
              <div
                className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-white to-transparent animate-line-flow-vertical"
                style={{ animationDelay: "1.7s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";

export default SearchBar;
