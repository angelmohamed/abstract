import * as React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {/* Search Icon */}
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <Search className="h-4 w-4" />
        </span>
        {/* Input Field */}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";

export default SearchBar;
