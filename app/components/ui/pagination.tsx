import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/app/components/ui/button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  className?: string;
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props} />
  )
)
Pagination.displayName = "Pagination"

interface PaginationContentProps extends React.ComponentProps<"ul"> {
  className?: string;
}

const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props} />
  )
)
PaginationContent.displayName = "PaginationContent"

interface PaginationItemProps extends React.ComponentProps<"li"> {
  className?: string;
}

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
)
PaginationItem.displayName = "PaginationItem"

interface PaginationLinkProps extends React.ComponentProps<"a"> {
  isActive?: boolean;
  size?: "default" | "icon";
  className?: string;
}

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(buttonVariants({
      variant: isActive ? "outline" : "ghost",
      size,
    }), className)}
    {...props} />
)
PaginationLink.displayName = "PaginationLink"

interface PaginationPreviousProps extends React.ComponentProps<"a"> {
  className?: string;
}

const PaginationPrevious = ({
  className,
  ...props
}: PaginationPreviousProps) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

interface PaginationNextProps extends React.ComponentProps<"a"> {
  className?: string;
}

const PaginationNext = ({
  className,
  ...props
}: PaginationNextProps) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

interface PaginationEllipsisProps extends React.ComponentProps<"span"> {
  className?: string;
}

const PaginationEllipsis = ({
  className,
  ...props
}: PaginationEllipsisProps) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
