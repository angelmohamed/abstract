"use client";
import { useEffect, useState } from "react";
import PaginationComp from "./PaginationComp";
import { Loader } from "lucide-react";
import EventCard from "@/app/components/ui/eventCard";
import { MultipleOptionCard } from "@/app/components/ui/multipleOptionCard";
import Link from "next/link";
import { getEventData } from "@/app/ApiAction/api";

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
        let { status, result } = await getEventData({ id: selectCategory, page: pagination.page, limit: pagination.limit });
        // const response = await fetch(
        //   `http://localhost:3001/api/v1/events/paginate/${selectCategory}`,
        //   {
        //     method: "POST",
        //     // headers: {
        //     //   "Content-Type": "application/x-www-form-urlencoded",
        //     // },
        //   }
        // );
        if(status){
          setEvents(result?.data);
          setHasMore(result?.count > pagination.page * pagination.limit);
        }
        // const data = await response.json();
        // if(response.status){
          // const data = response;
        console.log(result, "event-data");
        
        // }
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {events &&
          events.length > 0 &&
          events.map((event) => (
            <div
              key={event._id}
              className="event-card w-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              {event.marketId?.length < 2 ? (
                <Link href={`/event-page/${event._id}`} className="w-full block">
                  <EventCard
                    imageSrc={event?.image || '/images/logo.png'} // 提供默认图片路径
                    question={event?.title}
                    probability={
                      event.marketId[0]?.outcomePrices &&
                      JSON.parse(event.marketId[0]?.outcomePrices)[0]
                    }
                    totalPool={`$${(event.volume ? event.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")}`}
                    yesButtonLabel = {`${event.marketId[0]?.outcome?.[0]?.title || "Yes"} 24.0¢`}
                    noButtonLabel = {`${event.marketId[0]?.outcome?.[1]?.title || "No"} 74.0¢`}
                    yesPotential={
                      event.marketId[0]?.outcomePrices &&
                      JSON.parse(event.marketId[0]?.outcomePrices)[0]
                    }
                    noPotential={
                      event.marketId[0]?.outcomePrices &&
                      JSON.parse(event.marketId[0]?.outcomePrices)[1]
                    }
                    id={event._id}
                  />
                </Link>
              ) : (
                <Link href={`/event-page/${event._id}`} className="w-full block">
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