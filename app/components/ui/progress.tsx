"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(`relative h-2 w-full overflow-hidden rounded-full ${value != 0 ?"bg-[#ec4899]": "bg-[#3c3a3a]"}`, className)} // Unfilled: dark grey
    {...props}>
    <ProgressPrimitive.Indicator
      className={`h-full w-full flex-1 ${value != 0 ?"bg-[#7dfdfe]": "bg-[#3c3a3a]"} transition-all`} // Filled: white
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
