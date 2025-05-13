"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export interface FillBidProps extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> {
  value?: number | string
}

const FillBid = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  FillBidProps
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-10 w-full overflow-hidden bg-transparent", className)}
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-[#001202] transition-all"
      style={{ transform: `translateX(-${100 - (value ? Number(value) : 0)}%)` }} />
  </ProgressPrimitive.Root>
))
FillBid.displayName = ProgressPrimitive.Root.displayName

export { FillBid }