"use client";
import "@/app/globals.css";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Loader, TrendingUp } from "lucide-react";
import Ye from "/public/images/Ye.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import Header from "@/app/Header";
import { Nav as NavigationComponent } from "@/app/components/ui/navigation-menu";
import { navigationItems } from "@/app/components/constants";
import MultiLineChart from "@/app/components/customComponents/MultiLineChart";
import SingleLineChart from "@/app/components/customComponents/SingleLineChart";
import {
  OrderbookAccordion,
  OrderbookAccordionContent,
  OrderbookAccordionItem,
  OrderbookAccordionTrigger,
} from "@/app/components/ui/orderbookAccordion";
import ExpandableTextView from "@/app/components/customComponents/ExpandableTextView";
import ChartIntervals from "@/app/components/customComponents/ChartIntervals";
import { SelectSeparator } from "@/app/components/ui/select";
import Link from "next/link";
import { TradingCard } from "@/app/components/customComponents/TradingCard";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerHeader,
} from "@/app/components/ui/drawer";
import { CommentSection } from "@/app/components/ui/comment";

export default function EventPage() {
  const param = useParams();
  const id = param.id;

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookLabels, setBookLabels] = useState([]);
  const [activeView, setActiveView] = React.useState("Yes");
  const [interval, setInterval] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedOrderBookData, setSelectedOrderBookData] = useState([
    books[0],
    books[1],
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get Event Data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await fetch(`/api/event-data/by-id?id=${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const data = await response.json();
        setEvents(data);
        setMarkets(
          data?.markets
            .filter((market) => market.active)
            .sort((a, b) => b.bestAsk - a.bestAsk)
        );
        setEventsLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [id]);

  // Get Books Data
  useEffect(() => {
    if (markets.length > 0) {
      const ids = [];
      const bookLabelsTemp = [];
      markets
        .filter((market) => market.active)
        .sort((a, b) => b.bestAsk - a.bestAsk)
        .forEach((market, index) => {
          if (market.clobTokenIds) {
            const yes = JSON.parse(market.clobTokenIds)[0];
            const no = JSON.parse(market.clobTokenIds)[1];
            ids.push({ yes, no });
            bookLabelsTemp.push(market.groupItemTitle);
          }
        });

      const fetchAllBooks = async () => {
        const idsGroup = [];
        ids.map((id) => {
          return idsGroup.push({ token_id: id.yes }, { token_id: id.no });
        });

        try {
          const response = await fetch(`/api/event-data/books`, {
            method: "Post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(idsGroup),
          });
          setBooks(await response.json());
        } catch (error) {
          console.error("Error fetching PriceHistory:", error);
        }
      };
      fetchAllBooks();
      setBookLabels(bookLabelsTemp);
    }
  }, [id, markets, interval]);

  return (
    // <div className="overflow-hidden text-white bg-black sm:pr-10 sm:pl-10 pr-0 pl-0 justify-center h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] m-0">
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
        <Header />
        <NavigationComponent menuItems={navigationItems} showLiveTag={true} />
      </div>
      <div className="sm:pr-[10%] sm:pl-[10%] pl-0 pr-0">
        {eventsLoading ? (
          <div className="flex justify-center items-center h-[80vh] w-[80vw]">
            <Loader className="w-26 h-26 animate-spin bg-blend-overlay" />
            Loading...
          </div>
        ) : (
          <div className="sm:mx-auto mx-0 sm:px-4 px-0 sm:pt-4 pt-0">
            {/* Preview Card Section */}
            <div className="flex justify-center items-center">
              <div className="flex justify-center sm:max-w-8xl mb-0 w-full">
                {/* Main Content (Charts, Accordion, etc.) */}
                <div className="w-full pl-0 pr-0 lg:w-[70%]">
                  {markets.length < 2 ? (
                    <SingleLineChart
                      title={events.title}
                      volume={events.volume}
                      image={events.icon}
                      endDate={events.endDate}
                      market={markets}
                      interval={interval}
                      chance={markets[0]?.bestAsk} // 添加 chance 属性，使用市场的 bestAsk 值
                    />
                  ) : (
                    <MultiLineChart
                      title={events.title}
                      volume={events.volume}
                      image={events.icon}
                      markets={markets.filter((market) => market.active)}
                      endDate={events.endDate}
                      interval={interval}
                    />
                  )}
                  <div className="pl-12 pr-0 sm:pl-0 sm:pr-0 justify-center items-center">
                    <ChartIntervals
                      interval={interval}
                      setInterval={setInterval}
                    />
                  </div>

                  <div className="pr-10 pl-10 sm:pr-5 sm:pl-0">
                    {markets?.length < 2 && books ? (
                      <OrderbookAccordion type="single" collapsible>
                        <OrderbookAccordionItem value="item-1">
                          <OrderbookAccordionTrigger>
                            Orderbook
                          </OrderbookAccordionTrigger>
                          <OrderbookAccordionContent
                            orderBook={[
                              ...books.filter(
                                (book) =>
                                  book.asset_id ==
                                  JSON?.parse(markets[0]?.clobTokenIds)[0]
                              ),
                              ...books.filter(
                                (book) =>
                                  book.asset_id ==
                                  JSON?.parse(markets[0]?.clobTokenIds)[1]
                              ),
                            ]}
                            activeView={activeView}
                            setActiveView={setActiveView}
                            setSelectedOrderBookData={setSelectedOrderBookData}
                            setSelectedIndex={setSelectedIndex}
                            index={0}
                          />
                        </OrderbookAccordionItem>
                      </OrderbookAccordion>
                    ) : (
                      <>
                        <Accordion type="single" collapsible>
                          {markets
                            .filter((market) => market.active)
                            ?.map((market, index) => (
                              <AccordionItem
                                value={`market-${index + 1}`}
                                key={index}
                              >
                                <AccordionTrigger
                                  marketId="market-1"
                                  outcomePrice={
                                    market.outcomePrices &&
                                    JSON.parse(market.outcomePrices)[0]
                                  }
                                  className="flex sm:text-[18px] text-[18px] items-center sm:gap-2 gap-0"
                                  setSelectedOrderBookData={
                                    setSelectedOrderBookData
                                  }
                                  orderBook={[
                                    ...books.filter(
                                      (book) =>
                                        book.asset_id ==
                                        JSON?.parse(market?.clobTokenIds)[0]
                                    ),
                                    ...books.filter(
                                      (book) =>
                                        book.asset_id ==
                                        JSON?.parse(market?.clobTokenIds)[1]
                                    ),
                                  ]}
                                  setSelectedIndex={setSelectedIndex}
                                  index={index}
                                >
                                  <div className="pr-2">
                                    <Image
                                      src={market.icon}
                                      alt="Market 1"
                                      width={42}
                                      height={42}
                                    />
                                  </div>
                                  <span className="pt-1">
                                    {market.groupItemTitle}
                                  </span>
                                </AccordionTrigger>
                                <OrderbookAccordionContent
                                  orderBook={[
                                    ...books.filter(
                                      (book) =>
                                        book.asset_id ==
                                        JSON?.parse(market?.clobTokenIds)[0]
                                    ),
                                    ...books.filter(
                                      (book) =>
                                        book.asset_id ==
                                        JSON?.parse(market?.clobTokenIds)[1]
                                    ),
                                  ]}
                                  activeView={activeView}
                                  setActiveView={setActiveView}
                                  setSelectedOrderBookData={
                                    setSelectedOrderBookData
                                  }
                                  setSelectedIndex={setSelectedIndex}
                                  index={index}
                                />
                              </AccordionItem>
                            ))}
                        </Accordion>
                      </>
                    )}

                    <ExpandableTextView>
                      <h3 className="sm:text-[18px] text-[16px] font-bold sm:m-4 m-4">
                        Rules
                      </h3>
                      <SelectSeparator className="my-4" />
                      <p className="sm:text-base pl-4 sm:pr-0 pr-4 pb-0 sm:pl-0 text-[14px]">
                        {markets?.[selectedIndex]?.description}
                      </p>
                      <p className="pl-4 sm:pl-0 pr-4 sm:pr-4 text-[14px] sm:text-base">
                        Resolver:{" "}
                        <Link
                          href={`https://polygonscan.com/address/${markets?.[selectedIndex]?.resolvedBy}`}
                          target="_blank"
                          className="text-blue-500"
                        >
                          {markets?.[selectedIndex]?.resolvedBy}
                        </Link>
                      </p>
                    </ExpandableTextView>
                  </div>

                  {/* 评论区 Comment Section */}
                  <div className="pl-12 pr-0 sm:pl-0 sm:pr-0 mt-6">
                    <CommentSection eventId={id} />
                  </div>
                </div>

                {/* Trading Card (Desktop: Sticky, Hidden on Mobile) */}
                <div className="hidden lg:block lg:w-[30%] relative">
                  <div className="fixed right-[10%] top-[200px] w-[20%] z-60">
                    {markets.length < 2 ? (
                      <TradingCard
                        activeView={activeView}
                        setActiveView={setActiveView}
                        selectedOrderBookData={[
                          ...books.filter(
                            (book) =>
                              book.asset_id ==
                              JSON?.parse(markets[0]?.clobTokenIds)[0]
                          ),
                          ...books.filter(
                            (book) =>
                              book.asset_id ==
                              JSON?.parse(markets[0]?.clobTokenIds)[1]
                          ),
                        ]}
                        market={markets[selectedIndex]}
                      />
                    ) : (
                      <TradingCard
                        activeView={activeView}
                        setActiveView={setActiveView}
                        selectedOrderBookData={
                          selectedOrderBookData || [
                            ...books.filter(
                              (book) =>
                                book.asset_id ==
                                JSON?.parse(markets[0]?.clobTokenIds)[0]
                            ),
                            ...books.filter(
                              (book) =>
                                book.asset_id ==
                                JSON?.parse(markets[0]?.clobTokenIds)[1]
                            ),
                          ]
                        }
                        market={markets[selectedIndex]}
                      />
                    )}

                    {/* Spotify Embed */}
                    <div className="mt-6">
                      <iframe
                        style={{ borderRadius: "12px" }}
                        src="https://open.spotify.com/embed/track/6iycYUk3oB0NPMdaDUrN1w?utm_source=generator&theme=0"
                        width="100%"
                        height="146"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Card Drawer for Mobile */}
            <div className="lg:hidden w-[100%] justify-center pr-20 pl-20 pt-5 pb-10 items-center mt-0">
              {isDrawerOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setIsDrawerOpen(false)}
                ></div>
              )}
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger className="w-full py-2 font-semibold bg-white text-black rounded-lg">
                  Trade
                </DrawerTrigger>
                <DrawerContent className="h-[80vh] z-50">
                  {/* Hidden DrawerTitle to satisfy component requirements */}
                  <div hidden>
                    <DrawerHeader>
                      <DrawerTitle>Hidden Title</DrawerTitle>
                    </DrawerHeader>
                  </div>

                  {/* Main Content */}
                  <div className="p-4">
                    {markets.length < 2 ? (
                      <TradingCard
                        activeView={activeView}
                        setActiveView={setActiveView}
                        selectedOrderBookData={[
                          ...books.filter(
                            (book) =>
                              book.asset_id ==
                              JSON?.parse(markets[0]?.clobTokenIds)[0]
                          ),
                          ...books.filter(
                            (book) =>
                              book.asset_id ==
                              JSON?.parse(markets[0]?.clobTokenIds)[1]
                          ),
                        ]}
                        market={markets[selectedIndex]}
                      />
                    ) : (
                      <TradingCard
                        activeView={activeView}
                        setActiveView={setActiveView}
                        selectedOrderBookData={
                          selectedOrderBookData || [
                            ...books.filter(
                              (book) =>
                                book.asset_id ==
                                JSON?.parse(markets[0]?.clobTokenIds)[0]
                            ),
                            ...books.filter(
                              (book) =>
                                book.asset_id ==
                                JSON?.parse(markets[0]?.clobTokenIds)[1]
                            ),
                          ]
                        }
                        market={markets[selectedIndex]}
                      />
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        )}
        <div className="flex-1 pl-0 pr-0 sm:pl-[18%] sm:pr-[0%]">
          {" "}
          {/* This makes the left part wider */}
        </div>
      </div>
    </div>
  );
}
