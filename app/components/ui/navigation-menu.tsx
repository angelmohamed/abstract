"use client";
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 接口定义
interface MenuItem {
  title: string;
  subItems: SubItem[];
}

interface SubItem {
  title: string;
  description: string;
}

interface NavigationBarProps {
  menuItems: MenuItem[];
  showLiveTag?: boolean;
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
    {...props}>
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
    {...props} />
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
    {...props}>
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true" />
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
    {...props} />
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
      {...props} />
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
    {...props}>
    <div
      className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
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
export const NavigationBar: React.FC<NavigationBarProps> = ({ menuItems, showLiveTag = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);
  return (
    <div className="w-full flex justify-center mt-0 pb-3">
      {/* "LIVE" Tag - Only shown if showLiveTag is true */}
      {showLiveTag && (
        <div className="sm:pl-0 pl-3 flex items-center flex-shrink-0">
          <h1 className="pb-[2%] text-xl leading-tight pl-2">
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

      {/* Mobile Dropdown Button */}
      <div className="sm:hidden ml-auto pr-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Menu - Hidden on mobile, shown on larger screens */}
      <div className="block backdrop-blur-md sm:hidden">
        <div className="flex overflow-x-auto no-scrollbar py-2 space-x-4">
          {/* Horizontally Scrollable Categories */}
          <div className="pt-1 pl-2 flex space-x-4">
            {menuItems.map((item) => (
              <div key={item.title} className="flex-shrink-0">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs">{/* Optional Description */}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Navigation Menu - Show on larger screens */}
      <div className="hidden sm:block backdrop-blur-md">
        <NavigationMenu className="backdrop-blur-md">
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[800px] gap-3 p-6 md:w-[600px] md:grid-cols-4 lg:w-[800px]">
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.title} title={subItem.title}>
                        {subItem.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Dropdown Menu - Shown when isMobileMenuOpen is true */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-black backdrop-blur-md p-4 z-50">
          <ul className="space-y-2">
            {menuItems.flatMap(item => item.subItems).map((subItem) => (
              <li key={subItem.title}>
                <button
                  className="w-full text-left p-2 hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="text-sm font-medium">{subItem.title}</div>
                  <p className="text-xs text-gray-400">
                    {subItem.description}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Nav component for page headers
export const Nav: React.FC<NavigationBarProps> = ({ menuItems = [], showLiveTag = true }) => {
  return (
    <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
      {/* This assumes Header is imported where Nav is used */}
      <NavigationBar menuItems={menuItems} showLiveTag={showLiveTag} />
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
  ListItem
};
