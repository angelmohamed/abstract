"use client";
import { useEffect, useState } from "react";
import PaginationComp from "./PaginationComp";
import { Loader } from "lucide-react";
import EventCard from "@/app/components/ui/eventCard";
import { MultipleOptionCard } from "@/app/components/ui/multipleOptionCard";
import Link from "next/link";

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
        const response = await fetch(
          `/api/event-data/all?limit=${pagination.limit}&offset=${pagination.offset}&tag_slug=${selectCategory}&closed=${showClosed}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const data = await response.json();
        console.log(data, "event-data");
        setEvents(data.data);
        setHasMore(data?.pagination?.hasMore);
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
              key={event.id}
              className="event-card w-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              {event.markets.length < 2 ? (
                <Link href={`/event-page/${event.id}`} className="w-full block">
                  <EventCard
                    imageSrc={event?.icon || '/images/logo.png'} // 提供默认图片路径
                    question={event?.title}
                    probability={
                      event.markets[0].outcomePrices &&
                      JSON.parse(event.markets[0].outcomePrices)[0]
                    }
                    totalPool={`$${(event.volume ? event.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")}`}
                    yesPotential={
                      event.markets[0].outcomePrices &&
                      JSON.parse(event.markets[0].outcomePrices)[0]
                    }
                    noPotential={
                      event.markets[0].outcomePrices &&
                      JSON.parse(event.markets[0].outcomePrices)[1]
                    }
                    id={event.id}
                  />
                </Link>
              ) : (
                <Link href={`/event-page/${event.id}`} className="w-full block">
                  <MultipleOptionCard
                    imageSrc={event?.icon || '/images/logo.png'} // 提供默认图片路径
                    question={event?.title}
                    totalPool={`$${(event.volume ? event.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00")}`}
                    options={event?.markets}
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