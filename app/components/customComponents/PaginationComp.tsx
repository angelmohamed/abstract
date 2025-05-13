import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationState {
  page: number;
  limit: number;
  offset: number;
}

interface PaginationCompProps {
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  hasMore: boolean;
}

export default function PaginationComp({ pagination, setPagination, hasMore }: PaginationCompProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={cn(
              pagination.page === 1
                ? "pointer-events-none opacity-50 disabled"
                : "cursor-pointer"
            )}
            onClick={() =>
              setPagination({
                ...pagination,
                page: pagination.page - 1,
                offset: pagination.offset - pagination.limit,
              })
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            className={cn(
              pagination.page === 1
                ? "pointer-events-none opacity-50 disabled hidden"
                : "cursor-pointer"
            )}
            onClick={() =>
              setPagination({
                ...pagination,
                page: pagination.page - 1,
                offset: pagination.offset - pagination.limit,
              })
            }
          >
            {pagination.page - 1}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className={"cursor-pointer"} isActive>
            {pagination.page}
          </PaginationLink>
        </PaginationItem>
       { hasMore && <PaginationItem>
          <PaginationLink
            className={"cursor-pointer"}
            onClick={() =>
              setPagination({
                ...pagination,
                page: pagination.page + 1,
                offset: pagination.offset + pagination.limit,
              })
            }
          >
            {pagination.page + 1}
          </PaginationLink>
        </PaginationItem>}
        { hasMore && <PaginationItem>
          <PaginationNext
            className={"cursor-pointer"}
            onClick={() =>
              setPagination({
                ...pagination,
                page: pagination.page + 1,
                offset: pagination.offset + pagination.limit,
              })
            }
          />
        </PaginationItem>}
      </PaginationContent>
    </Pagination>
  );
}