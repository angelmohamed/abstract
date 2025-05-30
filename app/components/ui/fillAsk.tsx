"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export interface FillAskProps extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> {
  value?: number | string
}

const FillAsk = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  FillAskProps
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-10 w-full overflow-hidden bg-transparent", className)} // Changed bg-secondary to bg-pink-500
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-[#240000] transition-all" // Changed bg-primary to bg-[#27ae60]
      style={{ transform: `translateX(-${100 - (value ? Number(value) : 0)}%)` }} />
  </ProgressPrimitive.Root>
))
FillAsk.displayName = ProgressPrimitive.Root.displayName

export { FillAsk }