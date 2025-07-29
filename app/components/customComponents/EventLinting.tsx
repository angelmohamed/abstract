"use client";
import { useEffect, useState } from "react";
import PaginationComp from "./PaginationComp";
import { Loader } from "lucide-react";
import EventCard from "@/app/components/ui/eventCard";
import { MultipleOptionCard } from "@/app/components/ui/multipleOptionCard";
import Link from "next/link";
import { getEvents } from "@/services/market";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface Market {
  id: string;
  outcomePrices: string; // JSON string of prices
  [key: string]: any;
}

interface Event {
  id: string;
  title: string;
  icon?: string;
  markets: Market[];
  volume?: number;
  [key: string]: any;
}

interface PaginationState {
  page: number;
  limit: number;
  offset: number;
}

interface EventLintingProps {
  selectCategory: string;
  showClosed: boolean;
  selectedSubcategory: string;
}

export default function EventLinting({
  selectCategory,
  showClosed,
  selectedSubcategory,
}: EventLintingProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [events, setEvents] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 16,
    offset: 0,
  });
  const [selectedMarket, setSelectedMarket] = useState("open");

  useEffect(() => {
    // Reset pagination when category or showClosed changes
    setPagination({ page: 1, limit: 16, offset: 0 });
  }, [selectCategory, showClosed, selectedSubcategory, selectedMarket]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const finCategory = categoryParam ? categoryParam : selectCategory;
        let { success, result } = await getEvents({
          id: finCategory,
          page: pagination.page,
          limit: pagination.limit,
          tag: selectedSubcategory,
          status: selectedMarket,
        });
        if (success) {
          setEvents(result?.data);
          setHasMore(result?.count > pagination.page * pagination.limit);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [pagination, selectCategory, showClosed, categoryParam, selectedMarket]);

  return (
    <>
      {/* <div className="flex justify-end mb-9 w-full text-end">
        <Select value={selectedMarket} onValueChange={setSelectedMarket}>
          <SelectTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none w-64 h-12 border-[#464646]">
            <SelectValue placeholder="All Markets" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="open">Open Markets</SelectItem>
              <SelectItem value="closed">Closed Markets</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div> */}
      <div className="flex flex-col items-center justify-center gap-9 w-full mt-5">
        {loading && (
          <Loader className="w-26 h-26 animate-spin" />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
          {events &&
            events.length > 0 &&
            events.map((event) => (
              <div
                key={event._id}
                className={`event-card w-full rounded-lg transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                  event.status + "_event"
                }`}
              >
                {event.marketId?.length < 2 ? (
                  <Link
                    href={`/event-page/${event.slug}`}
                    className="w-full block"
                  >
                    <EventCard
                      imageSrc={event?.image || "/images/logo.png"} // 提供默认图片路径
                      question={event?.title}
                      probability={
                        // (event.marketId[0]?.outcomePrices &&
                        // JSON.parse(event.marketId[0]?.outcomePrices)[0] ) || 50
                        event.marketId[0]?.last
                      }
                      totalPool={`$${
                        event.marketId?.[0]?.volume
                          ? (event.marketId[0].volume / 100).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "0.00"
                      }`}
                      yesButtonLabel={`Buy ${
                        event.marketId[0]?.outcome?.[0]?.title || "Yes"
                      }`}
                      noButtonLabel={`Buy ${
                        event.marketId[0]?.outcome?.[1]?.title || "No"
                      }`}
                      yesPotential={
                        (event.marketId[0]?.outcomePrices &&
                          JSON.parse(event.marketId[0]?.outcomePrices)[0]) ||
                        50
                      }
                      noPotential={
                        (event.marketId[0]?.outcomePrices &&
                          JSON.parse(event.marketId[0]?.outcomePrices)[1]) ||
                        50
                      }
                      id={event._id}
                      status={event.status}
                      outcome={event?.outcome}
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/event-page/${event.slug}`}
                    className="w-full block"
                  >
                    <MultipleOptionCard
                      imageSrc={event?.image || "/images/logo.png"} // 提供默认图片路径
                      question={event?.title}
                      totalPool={
                        event.marketId
                          ? event.marketId?.reduce(
                              (acc, mark) => acc + (mark.volume || 0),
                              0
                            )
                          : 0
                      }
                      options={event?.marketId}
                      forecast={event?.forecast}
                      status={event.status}
                    />
                  </Link>
                )}
              </div>
            ))}
        </div>
        {!loading && events && events.length === 0 && (
          <div className="text-center text-gray-500">No events found</div>
        )}
        {(!hasMore && pagination.page === 1) ? null : (
          <PaginationComp
            pagination={pagination}
            setPagination={setPagination}
            hasMore={hasMore}
          />
        )}
      </div>
    </>
  );
}
