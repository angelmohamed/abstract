"use client";
import "@/app/globals.css";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useContext } from "react";
import { CheckCircle, ClockIcon, Loader, XCircle } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import Header from "@/app/Header";
import Chart from "@/app/components/customComponents/Chart";
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
import {
  SocketContext,
  subscribe,
  unsubscribe,
} from "@/config/socketConnectivity";
import { getOrderBook, getEventById, getCategories } from "@/services/market";
import { isEmpty } from "@/lib/isEmpty";
import { getOpenOrdersByEvtId } from "@/services/user";
import { OpenOrderDialog } from "@/app/components/customComponents/OpenOrderDialog";
import MultiLineChart from "@/app/components/customComponents/MultiLineChart";
import SingleLineChart from "@/app/components/customComponents/SingleLineChart";
import { Footer } from "@/app/components/customComponents/Footer";
import { Button } from "@/app/components/ui/button";
import ResolutionCard from "@/app/components/customComponents/ResolutionCard";
import MonthlyListenersChart from "@/app/components/customComponents/MonthlyListenersChart";
// import TravisScott from "../../../public/images/travis.png";
// import SpotifyLogo from "../../../public/images/spotifylogo.png";
import Jackboys2 from "@/public/images/jackboys2.png";
import Astroworld from "@/public/images/astroworld.png";
import { NavigationBar } from "@/app/components/ui/navigation-menu";
import HeaderFixed from "@/app/HeaderFixed";

export default function EventPage({ categories }) {
  const param = useParams();
  const id = param.id;
  const socketContext = useContext(SocketContext);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [books, setBooks] = useState([]);
  const [bookLabels, setBookLabels] = useState([]);
  const [activeView, setActiveView] = React.useState("Yes");
  const [forecastGraph, setForecastGraph] = React.useState(false);
  const [interval, setInterval] = useState("max");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedOrderBookData, setSelectedOrderBookData] = useState([
    books[0],
    books[1],
  ]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openItem, setOpenItem] = useState("orderbook");
  const [openOrders, setOpenOrders] = useState([]);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [selectCategory, setSelectedCategory] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState({});

  useEffect(() => {
    const eventId = events?._id;
    if (!isEmpty(eventId)) {
      subscribe(events._id);
      return () => {
        unsubscribe(events?._id);
      };
    }
  }, [events?._id]);

  useEffect(() => {
    const socket = socketContext?.socket;
    const eventId = events?._id;

    if (!socket || !eventId) return;

    const handleDisconnect = () => {
      console.log("socket disconnected", eventId);
      subscribe(eventId);
    };

    socket.on("disconnect", handleDisconnect);

    // Cleanup function
    return () => {
      socket.off("disconnect", handleDisconnect);
    };
  }, [socketContext?.socket, events?._id]);

  useEffect(() => {
    const socket = socketContext?.socket;
    if (!socket) return;

    const handleOrderbook = (result) => {
      const orderbook = JSON.parse(result);
      // console.log("socket: orderbook result", orderbook);
      setBooks((prev) =>
        prev.map((item) =>
          item.marketId === orderbook.marketId
            ? { ...item, bids: orderbook.bids, asks: orderbook.asks }
            : item
        )
      );
    };

    const handleRecentTrade = (result) => {
      const recentTrade = JSON.parse(result);
      // console.log("socket: recent trades result", recentTrade);
      setMarkets((prev) =>
        prev.map((item) =>
          item._id === recentTrade.market
            ? {
                ...item,
                last:
                  recentTrade.side == "no"
                    ? 100 - recentTrade.p
                    : recentTrade.p,
              }
            : item
        )
      );
    };

    socket.on("orderbook", handleOrderbook);
    socket.on("recent-trade", handleRecentTrade);

    return () => {
      socket.off("orderbook");
      socket.off("recent-trade");
    };
  }, [socketContext?.socket]);

  const handleOpenOrderDialog = (id) => {
    getOpenOrders(id);
    setOpenOrderDialog(true);
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        let { success, result } = await getEventById({ id: id });
        if (success) {
          setEvents(result);
          if (result?.marketId && result?.marketId.length > 0) {
            setMarkets(
              result.marketId.filter((market) =>
                ["active", "closed", "resolved"].includes(market.status)
              )
            );
            console.log(
              result?.marketId,
              result.marketId.filter((market) =>
                ["active", "closed", "resolved"].includes(market.status)
              ),
              "active.Iad"
            );
          }
        }
        setEventsLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, [id]);

  const fetchAllBooks = async () => {
    try {
      const { success, orderbook } = await getOrderBook({ id: id });
      if (success) {
        setBooks(orderbook);
      }
    } catch (error) {
      console.error("Error fetching PriceHistory:", error);
    }
  };

  // Get Books Data
  useEffect(() => {
    if (markets.length > 0) {
      const ids = [];
      const bookLabelsTemp = [];
      markets
        .filter((market) => market.status === "active")
        // .sort((a, b) => b.bestAsk - a.bestAsk)
        .forEach((market, index) => {
          if (market.clobTokenIds) {
            const yes = JSON.parse(market?.clobTokenIds)?.[0] || "";
            const no = JSON.parse(market?.clobTokenIds)?.[1] || "";
            ids.push({ yes, no });
            bookLabelsTemp.push(market.groupItemTitle);
          }
        });
      fetchAllBooks();
      setBookLabels(bookLabelsTemp);
    }
  }, [id, markets, interval]);

  const getOpenOrders = async (id) => {
    try {
      const { success, result } = await getOpenOrdersByEvtId({ id: id });
      if (success) {
        setOpenOrders(result);
      } else {
        setOpenOrders([]);
      }
    } catch (error) {
      console.error("Error fetching open orders:", error);
    }
  };

  return (
    <>
      {/* <div className="overflow-hidden text-white bg-black sm:pr-10 sm:pl-10 pr-0 pl-0 justify-center h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] m-0"> */}
      <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
        <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
          <Header />
          <NavigationBar
            menuItems={categories}
            showLiveTag={true}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectCategory}
            redirect={true}
          />
        </div>
        <div className="container mx-auto px-4 max-w-full overflow-hidden">
          {eventsLoading ? (
            <div className="flex justify-center items-center h-[80vh] w-[80vw]">
              <Loader className="w-26 h-26 animate-spin bg-blend-overlay" />
              Loading...
            </div>
          ) : (
            <div className="sm:mx-auto mx-0 sm:pt-4 pt-0">
              {/* Preview Card Section */}
              <div className="flex justify-center items-center">
                <div className="flex justify-center sm:max-w-8xl mb-0 w-full gap-5">
                  {/* Main Content (Charts, Accordion, etc.) */}
                  <div className="w-full lg:w-[70%]">
                    {events?.forecast ? (
                      <MonthlyListenersChart
                        title={events?.title}
                        volume={
                          markets?.reduce(
                            (acc, market) => acc + (market.volume || 0),
                            0
                          ) || 0
                        }
                        image={events?.image}
                        endDate={events.endDate}
                        eventId={events?._id}
                        eventSlug={events?.slug}
                        interval={interval}
                        albumReleases={[
                          {
                            date: "Feb 12",
                            title: "ASTROWORLD",
                            cover: Astroworld,
                          },
                          {
                            date: "Apr 16",
                            title: "JACKBOYS 2",
                            cover: Jackboys2,
                          },
                        ]}
                      />
                    ) : (
                      <Chart
                        id={id}
                        title={events?.title}
                        volume={
                          markets?.reduce(
                            (acc, market) => acc + (market.volume || 0),
                            0
                          ) || 0
                        }
                        image={events?.image || "/images/logo.png"}
                        endDate={events?.endDate}
                        market={markets}
                        interval={interval}
                        chance={markets[0]?.odd || 0}
                        series={events?.seriesId}
                      />
                    )}
                    {/* {markets.length < 2 ? (
                      <SingleLineChart
                        title={events.title}
                        volume={events.volume}
                        image={events.image || "/images/logo.png"}
                        endDate={events.endDate}
                        market={markets}
                        interval={interval}
                        chance={markets[0]?.bestAsk} // 添加 chance 属性，使用市场的 bestAsk 值
                      />
                    ) : (
                      <MultiLineChart
                        title={events.title}
                        volume={events.volume}
                        image={events.image || "/images/logo.png"}
                        markets={markets.filter(
                          (market) => market.status === "active"
                        )}
                        endDate={events.endDate}
                        interval={interval}
                      />
                    )}
                    Check */}
                    {/* <MultiLineChart
                        title={events.title}
                        volume={events.volume}
                        image={events.image || "/images/logo.png"}
                        markets={markets.filter(
                          (market) => market.status === "active"
                        )}
                        endDate={events.endDate}
                        interval={interval}
                      /> */}
                    <div className="flex justify-center items-center mb-8">
                      <ChartIntervals
                        interval={interval}
                        setInterval={setInterval}
                      />
                    </div>

                    <div className="">
                      {events?.status == "resolved" && <hr className="mt-4" />}
                      {markets?.length < 2 &&
                      books &&
                      events?.status != "resolved" ? (
                        <OrderbookAccordion
                          type="single"
                          value={openItem}
                          onValueChange={setOpenItem}
                          defaultValue="orderbook"
                          collapsible
                        >
                          <OrderbookAccordionItem value="orderbook">
                            <OrderbookAccordionTrigger>
                              Orderbook
                              {/* <ClockIcon className="w-4 h-4" onClick={(e)=>{
                                e.stopPropagation();
                                handleOpenOrderDialog( markets[0]?._id)
                              }}/> */}
                            </OrderbookAccordionTrigger>
                            <OrderbookAccordionContent
                              orderBook={
                                books?.find(
                                  (book) =>
                                    book.marketId ==
                                    // JSON?.parse(market?.clobTokenIds)[0]
                                    markets[0]?._id
                                ) || {}
                              }
                              isOpen={openItem === "orderbook"}
                              activeView={activeView}
                              setActiveView={setActiveView}
                              setSelectedOrderBookData={
                                setSelectedOrderBookData
                              }
                              setSelectedIndex={setSelectedIndex}
                              index={0}
                              selectedMarket={markets[0]}
                              setSelectedOrder={setSelectedOrder}
                              // isResolved={events?.isResolved}
                              forecastGraph={forecastGraph}
                              setForecastGraph={setForecastGraph}
                            />
                          </OrderbookAccordionItem>
                        </OrderbookAccordion>
                      ) : (
                        <>
                          <Accordion type="single" collapsible>
                            {markets &&
                              markets?.length > 0 &&
                              events?.status != "resolved" &&
                              markets
                                // .filter((market) => market.status === "active")
                                ?.map((market, index) => (
                                  <AccordionItem
                                    value={`market-${index + 1}`}
                                    key={index}
                                  >
                                    <AccordionTrigger
                                      marketId="market-1"
                                      outcomePrice={market?.odd || 0}
                                      className="flex sm:text-[18px] text-[18px] items-center sm:gap-2 gap-0"
                                      setSelectedOrderBookData={
                                        setSelectedOrderBookData
                                      }
                                      orderBook={
                                        books?.find(
                                          (book) =>
                                            book.marketId ==
                                            // JSON?.parse(market?.clobTokenIds)[0]
                                            market?._id
                                        ) || {}
                                      }
                                      setSelectedIndex={setSelectedIndex}
                                      index={index}
                                    >
                                      <div className="pr-6">
                                        <img
                                          src={events?.image}
                                          alt="Market 1"
                                          width={42}
                                          height={42}
                                          className="rounded-md object-cover"
                                          style={{
                                            width: "42px",
                                            height: "42px",
                                          }}
                                        />
                                      </div>
                                      <span className="pt-1">
                                        {market.groupItemTitle}
                                      </span>
                                    </AccordionTrigger>
                                    <OrderbookAccordionContent
                                      orderBook={
                                        books?.find(
                                          (book) =>
                                            book.marketId ==
                                            // JSON?.parse(market?.clobTokenIds)[0]
                                            market?._id
                                        ) || {}
                                      }
                                      book={books}
                                      activeView={activeView}
                                      setActiveView={setActiveView}
                                      setSelectedOrderBookData={
                                        setSelectedOrderBookData
                                      }
                                      setSelectedIndex={setSelectedIndex}
                                      index={index}
                                      selectedMarket={market}
                                      setSelectedOrder={setSelectedOrder}
                                      // isResolved={events?.isResolved}
                                      forecast={events?.forecast}
                                      forecastGraph={forecastGraph}
                                      setForecastGraph={setForecastGraph}
                                    />
                                  </AccordionItem>
                                ))}
                          </Accordion>
                        </>
                      )}

                      {events?.status == "resolved" &&
                        markets.length >= 2 &&
                        markets.map((market, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className="flex justify-between items-center px-4 py-3 border-b border-[#2a2a2a] hover:bg-[#1d1d1d] cursor-pointer"
                          >
                            <div>
                              <h3 className="text-[15px] sm:text-[16px] font-bold text-white flex items-center gap-2">
                                {market.groupItemTitle}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                ${Number(market.volume).toLocaleString()} Vol.
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <p
                                className={`text-sm font-semibold ${
                                  events.outcomeId === market._id
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {events.outcomeId === market._id ? "Yes" : "No"}
                              </p>
                              {events.outcomeId === market._id ? (
                                <CheckCircle
                                  className="w-5 h-5 text-green-500"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <XCircle
                                  className="w-5 h-5 text-red-500"
                                  strokeWidth={2.5}
                                />
                              )}
                            </div>
                          </div>
                        ))}

                      {/* <ExpandableTextView>
                        <h3 className="sm:text-[18px] text-[16px] font-bold sm:m-4 m-4">
                          Rules
                        </h3>
                        <SelectSeparator className="my-4" />
                        <p className="sm:text-base pl-4 sm:pr-0 pr-4 pb-0 sm:pl-0 text-[14px]">
                          {events?.description}
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
                      </ExpandableTextView> */}
                      <h3 className="sm:text-[18px] text-[16px] font-bold sm:m-4 m-4">
                        Rules
                      </h3>
                      <SelectSeparator className="my-4" />
                      <div className="sm:text-base pl-4 sm:pr-0 pr-4 pb-0 sm:pl-0 text-[14px]">
                        {events?.description?.length > 250 ? (
                          <div className="space-y-0">
                            <div
                              className={`line-clamp-5 transition-all duration-300 ${
                                showFullText ? "line-clamp-none" : ""
                              }`}
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {showFullText
                                ? events?.description
                                : events?.description?.slice(0, 250) + " ..."}
                            </div>
                            <div className="flex items-center justify-between">
                              <Button
                                variant="link"
                                onClick={() => setShowFullText(!showFullText)}
                                className="text-sm text-primary"
                              >
                                {showFullText ? "Show Less" : "Show More"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          events?.description
                        )}
                      </div>

                      {events?.status === "closed" && (
                        <div className="flex items-start gap-3 p-4 my-3 rounded-md border border-red-500 bg-[#2a1414] text-red-300">
                          {/* <XCircle className="w-5 h-5 mt-0.5 text-red-400" /> */}
                          <div>
                            <p className=" font-semibold">Market Closed</p>
                            <p className="text-sm text-red-400">
                              This market has ended and is awaiting resolution.
                              Final outcome will be announced soon.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 评论区 Comment Section */}
                    <div className="pl-12 pr-0 sm:pl-0 sm:pr-0 mt-6">
                      <CommentSection eventId={events?._id} />
                    </div>
                  </div>

                  {/* Trading Card (Desktop: Sticky, Hidden on Mobile) */}
                  {events?.status == "resolved" ? (
                    <div className="hidden lg:block lg:w-[15%] relative">
                      <div className="fixed top-[147px] z-60 w-[15%]">
                        <ResolutionCard
                          outcome={events?.outcome}
                          outcomeId={events?.outcomeId}
                          eventType={
                            markets?.length > 1 ? "Multiple Choice" : "Binary"
                          }
                          market={markets[selectedIndex]}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="hidden lg:block lg:w-[30%] relative">
                      <div className="fixed top-[147px] z-60 w-[300px] xl:w-[350px]">
                        <TradingCard
                          activeView={activeView}
                          setActiveView={setActiveView}
                          selectedOrderBookData={
                            books?.find(
                              (book) =>
                                book.marketId == markets[selectedIndex]?._id
                            ) || {}
                          }
                          market={markets[selectedIndex]}
                          status={events?.status}
                          image={events?.image}
                          selectedOrder={selectedOrder}
                          title={events?.title}
                        />

                        {/* Spotify Embed */}
                        {/* <div className="mt-6">
                        <iframe
                          style={{ borderRadius: "12px" }}
                          src="https://open.spotify.com/embed/track/6iycYUk3oB0NPMdaDUrN1w?utm_source=generator&theme=0"
                          width="100%"
                          height="146"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                        ></iframe>
                      </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trading Card Drawer for Mobile */}
              <div className="lg:hidden justify-center pt-5 pb-10 items-center mt-0 fixed bottom-[24px] left-0 w-full z-50">
                {isDrawerOpen && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsDrawerOpen(false)}
                  ></div>
                )}
                {events?.status == "resolved" ? (
                  <ResolutionCard />
                ) : (
                  <>
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                      <DrawerTrigger className="w-full py-2 font-semibold bg-black border-t border-[#1E1E1E] text-black rounded-lg">
                        <div className="flex items-center justify-between gap-5 w-full pr-5 pl-5">
                          <Button className="flex-1 !bg-[#0D1A26] rounded-lg h-12 text-[#7DFDFE] text-base font-medium leading-tight">Yes</Button>
                          <Button className="flex-1 !bg-[#210D1A] rounded-lg h-12 text-[#EC4899] text-base font-medium leading-tight">No</Button>
                        </div>
                      </DrawerTrigger>
                      <DrawerContent className="h-[80vh] z-50">
                        {/* Hidden DrawerTitle to satisfy component requirements */}
                        <div hidden>
                          <DrawerHeader>
                            <DrawerTitle>Hidden Title</DrawerTitle>
                          </DrawerHeader>
                        </div>

                        {/* Main Content */}
                        <div className="p-0">
                          <TradingCard
                            activeView={activeView}
                            setActiveView={setActiveView}
                            selectedOrderBookData={
                              selectedOrderBookData ||
                              books?.find(
                                (book) =>
                                  book.marketId ==
                                  // JSON?.parse(market?.clobTokenIds)[0]
                                  markets[selectedIndex]?._id
                              ) ||
                              {}
                            }
                            market={markets[selectedIndex]}
                            status={events?.status}
                            image={events?.image}
                            title={events?.title}
                          />
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="flex-1 pl-0 pr-0 sm:pl-[18%] sm:pr-[0%]">
            {" "}
            {/* This makes the left part wider */}
          </div>
          <OpenOrderDialog
            openOrderDialog={openOrderDialog}
            setOpenOrderDialog={setOpenOrderDialog}
            openOrderData={openOrders}
          />
        </div>
      </div>
      <Footer />
      <HeaderFixed />
    </>
  );
}
