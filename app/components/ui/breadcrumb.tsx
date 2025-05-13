import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />
)
Breadcrumb.displayName = "Breadcrumb"

interface BreadcrumbListProps extends React.OlHTMLAttributes<HTMLOListElement> {}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props} />
))
BreadcrumbList.displayName = "BreadcrumbList"

interface BreadcrumbItemProps extends React.LiHTMLAttributes<HTMLLIElement> {}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    (<Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props} />)
  );
})
BreadcrumbLink.displayName = "BreadcrumbLink"

interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props} />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

interface BreadcrumbSeparatorProps extends React.LiHTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode;
}

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ children, className, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
      {...props}>
      {children ?? <ChevronRight />}
    </li>
  )
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

interface BreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {}

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  )
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
