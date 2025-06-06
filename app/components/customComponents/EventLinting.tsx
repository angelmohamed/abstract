"use client";
import { useEffect, useState } from "react";
import PaginationComp from "./PaginationComp";
import { Loader } from "lucide-react";
import EventCard from "@/app/components/ui/eventCard";
import { MultipleOptionCard } from "@/app/components/ui/multipleOptionCard";
import Link from "next/link";
import { getEvents } from "@/services/market";

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
}

export default function EventLinting({ selectCategory, showClosed }: EventLintingProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 8,
    offset: 0,
  });

  useEffect(() => {
    // Reset pagination when category or showClosed changes
    setPagination({ page: 1, limit: 8, offset: 0 });
  }, [selectCategory, showClosed]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let { success, result } = await getEvents({ id: selectCategory, page: pagination.page, limit: pagination.limit });
        if(success){
          setEvents(result?.data);
          setHasMore(result?.count > pagination.page * pagination.limit);
        }
        console.log(result, "event-data");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [pagination, selectCategory, showClosed]);

  return (
    <div className="flex flex-col items-center justify-center gap-9 w-full">
      {loading && (
        <Loader className="w-26 h-26 absolute animate-spin bg-blend-overlay" />
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
        {events &&
          events.length > 0 &&
          events.map((event) => (
            <div
              key={event._id}
              className="event-card w-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              {event.marketId?.length < 2 ? (
                <Link href={`/event-page/${event.slug}`} className="w-full block">
                  <EventCard
                    imageSrc={event?.image || '/images/logo.png'} // 提供默认图片路径
                    question={event?.title}
                    probability={
                      // (event.marketId[0]?.outcomePrices &&
                      // JSON.parse(event.marketId[0]?.outcomePrices)[0] ) || 50
                      event.marketId[0]?.last
                    }

                    totalPool={`$${(event.volume ? event.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")}`}
                    yesButtonLabel = {`Buy ${event.marketId[0]?.outcome?.[0]?.title || "Yes"}`}
                    noButtonLabel = {`Buy ${event.marketId[0]?.outcome?.[1]?.title || "No"}`}
                    yesPotential={
                      event.marketId[0]?.outcomePrices &&
                      JSON.parse(event.marketId[0]?.outcomePrices)[0] || 50
                    }
                    noPotential={
                      event.marketId[0]?.outcomePrices &&
                      JSON.parse(event.marketId[0]?.outcomePrices)[1] || 50
                    }
                    id={event._id}
                  />
                </Link>
              ) : (
                <Link href={`/event-page/${event.slug}`} className="w-full block">
                  <MultipleOptionCard
                    imageSrc={event?.image || '/images/logo.png'} // 提供默认图片路径
                    question={event?.title}
                    totalPool={`$${(event.volume ? event.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")}`}
                    options={event?.marketId}
                  />
                </Link>
              )}
            </div>
          ))}
      </div>
      <PaginationComp
        pagination={pagination}
        setPagination={setPagination}
        hasMore={hasMore}
      />
    </div>
  );
}