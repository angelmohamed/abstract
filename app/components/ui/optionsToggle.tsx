"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Options = TabsPrimitive.Root

const OptionsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground",
      className
    )}
    {...props} />
))
OptionsList.displayName = TabsPrimitive.List.displayName

const OptionsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
<TabsPrimitive.Trigger
  ref={ref}
  className={cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium border-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "bg-[#1e1e1e] text-white border-transparent hover:bg-[#2a2a2a]",
    "data-[state=active]:bg-[#244d55] data-[state=active]:text-[#7dfdfe] data-[state=active]:border-[#244d55]",
    className
  )}
  {...props}
/>


))
OptionsTrigger.displayName = TabsPrimitive.Trigger.displayName

const OptionsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
OptionsContent.displayName = TabsPrimitive.Content.displayName

export { Options, OptionsList, OptionsTrigger, OptionsContent }
