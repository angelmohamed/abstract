"use client";
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ScrollArea } from "radix-ui";
import { useRouter, useSearchParams } from "next/navigation";
interface MenuItem {
  title: string;
  slug: string;
}

interface NavigationBarProps {
  menuItems: MenuItem[];
  showLiveTag?: boolean;
  setSelectedCategory: (category: string) => void;
  selectedCategory: string;
  redirect?: boolean;
}

interface ListItemProps {
  title: string;
  children: React.ReactNode;
}

// Base Navigation Menu Components
const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

// ListItem component for navigation menu content
const ListItem: React.FC<ListItemProps> = ({ title, children }) => {
  return (
    <li>
      <div
        className={cn(
          "block select-none rounded-md p-3 leading-none transition-colors hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="text-sm leading-snug text-muted-foreground">{children}</p>
      </div>
    </li>
  );
};

// NavigationBar component with mobile support
export const NavigationBar: React.FC<NavigationBarProps> = ({
  menuItems,
  showLiveTag = true,
  setSelectedCategory,
  selectedCategory,
  redirect = false,
}) => {
  const categoryListRef = React.useRef<HTMLDivElement>(null);
  React.useState(true);
  const [categoryScrollAtStart, setCategoryScrollAtStart] =
    React.useState(true);
  const [categoryScrollAtEnd, setCategoryScrollAtEnd] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = searchParams.get("category");

  const handleCategoryScroll = () => {
    const el = categoryListRef.current;
    if (!el) return;
    setCategoryScrollAtStart(el.scrollLeft === 0);
    setCategoryScrollAtEnd(
      el.scrollLeft + el.offsetWidth >= el.scrollWidth - 1
    );
  };

  React.useEffect(() => {
    handleCategoryScroll();
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    router.replace(window.location.pathname);
  };

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  return (
    <div className="container mx-auto px-4 max-w-full overflow-hidden relative">
      <div className="w-full flex justify-start mt-0">
        {/* "LIVE" Tag - Only shown if showLiveTag is true */}
        {showLiveTag && (
          <div className="flex items-center flex-shrink-0">
            <h1 className="pb-[2%] text-xl leading-tight pl-0">
              <span
                className="font-semibold text-red-500"
                style={{
                  fontSize: "18px",
                }}
              >
                LIVE
              </span>
            </h1>
            <div className="text-4xl pb-[6%]">
              <span className="live-dot">•</span>
            </div>
          </div>
        )}

        {/* Horizontal category list with arrows */}
        <div className="flex items-center w-full mx-4">
          {/* <button
            className="p-2 text-white bg-[transparent] mr-2 disabled:opacity-0"
            onClick={() => {
              categoryListRef.current?.scrollBy({
                left: -150,
                behavior: "smooth",
              });
            }}
            aria-label="Scroll left"
            disabled={categoryScrollAtStart}
            type="button"
          >
            <ChevronLeftIcon height={24} width={24} />
          </button> */}

          <div
            ref={categoryListRef}
            className="flex flex-nowrap gap-2 py-3"
            style={{ scrollBehavior: "smooth" }}
            onScroll={handleCategoryScroll}
          >
            <div
              className={cn(
                "px-3 py-1 rounded-md transition-colors text-sm font-medium whitespace-nowrap text-left pl-0 shadow-lg cursor-pointer",
                "text-[#666] hover:text-gray-400",
                selectedCategory === "all" && "text-white"
              )}
              onClick={() => handleCategoryClick("all")}
            >
              Trending
            </div>
            {menuItems.length > 0 &&
              menuItems.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "px-3 py-1 rounded-md transition-colors text-sm font-medium whitespace-nowrap text-left pl-0 shadow-lg cursor-pointer",
                    "text-[#666] hover:text-gray-400",
                    selectedCategory === item.slug && "text-white"
                  )}
                  onClick={() => router.push(`/?category=${item.slug}`)}
                >
                  {item.title}
                </div>
              ))}
          </div>

          {/* <button
            className="p-2 text-white bg-[transparent] ml-2 disabled:opacity-0"
            onClick={() => {
              categoryListRef.current?.scrollBy({
                left: 150,
                behavior: "smooth",
              });
            }}
            aria-label="Scroll right"
            disabled={categoryScrollAtEnd}
            type="button"
          >
            <ChevronRightIcon height={24} width={24} />
          </button> */}
        </div>
      </div>
      {/* Right fade overlay positioned at the edge of the scroll area */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black to-transparent"></div>
    </div>
  );
};

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  ListItem,
};
