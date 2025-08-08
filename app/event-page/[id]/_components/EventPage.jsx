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
import { Footer } from "@/app/components/customComponents/Footer";
import { Button } from "@/app/components/ui/button";
import ResolutionCard from "@/app/components/customComponents/ResolutionCard";
import MonthlyListenersChart2 from "@/app/components/customComponents/MonthlyListenersChart2";
// import TravisScott from "../../../public/images/travis.png";
// import SpotifyLogo from "../../../public/images/spotifylogo.png";
import Jackboys2 from "@/public/images/jackboys2.png";
import Astroworld from "@/public/images/astroworld.png";
import { NavigationBar } from "@/app/components/ui/navigation-menu";
import HeaderFixed from "@/app/HeaderFixed";
import { toFixedDown } from "@/lib/roundOf";

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
  const [interval, setInterval] = useState("all");
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

  // Helper functions for price calculation (same as TradingCard)
  const descending = (a, b) => Number(b[0]) - Number(a[0]);
  const ascending = (a, b) => Number(a[0]) - Number(b[0]);

  // Function to calculate the lowest ask price for a market
  const getLowestAskPrice = (marketId) => {
    const orderBook = books?.find(book => book.marketId === marketId);
    if (!orderBook) return null;
    
    // Get Yes ask price (100 - lowest yes ask)
    const yesAsk = orderBook?.asks?.[0]?.sort(descending)?.[0];
    const yesPrice = yesAsk?.length > 0 ? toFixedDown(100 - yesAsk[0], 2) : null;
    
    return yesPrice;
  };

    const getHighestBidPrice = (marketId) => {
    const orderBook = books?.find(book => book.marketId === marketId);
    if (!orderBook) return null;

    // Get Yes bid price (100 - highest yes bid)
    const yesBid = orderBook?.bids?.[0]?.sort(descending)?.[0];
    const yesPrice = yesBid?.length > 0 ? toFixedDown(100 - yesBid[0], 2) : null;

    return yesPrice;
  };

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
      {/* <div className="overflow-hidden text-white bg-black sm:pr-10 sm:pl-10 pr-0 pl-0 justify-center h-auto items-center justify-items-center m-0"> */}
      <div className="text-white bg-black h-auto items-center justify-items-center p-0 m-0">
        <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md bg-black/90 border-b border-[#222] lg:mb-4 mb-0" style={{ borderBottomWidth: '1px' }}>
          <Header />
          <div className="hidden lg:block">
            <NavigationBar
              menuItems={categories}
              showLiveTag={true}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectCategory}
              redirect={true}              
            />
          </div>
        </div>
        <div className="container mx-auto px-0 sm:px-4 max-w-full overflow-hidden">
          {eventsLoading ? (
            <div className="flex justify-center items-center h-[80vh] w-[80vw]">
              <Loader className="w-26 h-26 animate-spin bg-blend-overlay" />
              Loading...
            </div>
          ) : (
            <div className="sm:mx-auto mx-0 sm:pt-4 pt-0 px-1 sm:px-0">
              {/* Preview Card Section */}
              <div className="flex justify-center items-center">
                <div className="flex justify-center sm:max-w-8xl mb-0 w-full gap-5">
                  {/* Main Content (Charts, Accordion, etc.) */}
                  <div className="w-full lg:w-[70%]">
                    {events?.forecast ? (
                      <MonthlyListenersChart2
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
                    <div className="flex justify-center items-center mt-2 sm:mt-0 mb-4 sm:mb-8 md:mb-8 text-xs sm:text-base" style={{ marginTop: '0.5rem', marginBottom: '1rem', transform: 'scale(0.85)', maxWidth: '90vw' }}>
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
                              interval={interval}
                            />
                          </OrderbookAccordionItem>
                        </OrderbookAccordion>
                      ) : (
                        <>
                          <Accordion type="single" collapsible>
                            <div className="flex items-center w-full py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t-2 border-b border-[#222] bg-black">
                              <div className="flex items-center pr-6" style={{ width: 320 }}>
                                Outcome
                              </div>
                              <div className="flex-1 flex justify-end md:justify-center md:justify-end md:pl-0">
                                Chance
                              </div>
                              <div className="hidden md:flex items-center gap-1" style={{minWidth: 300}}>
                                {/* Empty for Yes/No buttons - hidden on mobile */}
                              </div>
                            </div>

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
                                      isMultiMarket={markets?.length > 1}
                                      setIsDrawerOpen={setIsDrawerOpen}
                                      setActiveView={setActiveView}
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
                      <h3 className="sm:text-[22px] text-[15px] font-bold sm:mt-6 sm:mb-2 sm:mr-4 mt-4 mb-1">
                        Rules
                      </h3>
                      <SelectSeparator className="my-2" />
                      <div className="sm:text-base pb-0 text-[12px] text-gray-400">
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
                                className="text-[12px] sm:text-sm text-gray-400 font-bold px-0 mt-0.5 !no-underline"
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
                    <div className="mt-4">
                      <CommentSection eventId={events?._id} />
                    </div>
                    {/* Discord Community Section - Web only, under comments */}
                    <div className="hidden sm:flex w-full max-w-7xl mx-auto mt-5 mb-5 justify-center">
                      <div
                        className="bg-black rounded-md px-4 py-5 sm:px-6 sm:py-8 flex flex-col items-center w-full max-w-xs sm:max-w-xl border border-[#222] shadow-sm gap-2"
                        style={{ boxShadow: '0 2px 6px 0 rgba(220,220,255,0.13)' }}
                      >
                        <h3 className="text-base sm:text-xl font-bold mb-1 text-white">Join our Discord community</h3>
                        <p className="text-xs sm:text-sm text-gray-300 mb-2 text-center">Connect with other traders, get support, and stay up to date with the latest news and features.</p>
                        <a
                          href="https://discord.com/invite/sonotrade"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-2 py-2 rounded-md transition-colors duration-200 text-xs sm:text-sm flex items-center gap-1"
                        >
                          <img src="/images/discordnew.png" alt="Discord" width={16} height={16} className="mr-1" />
                          Join Discord
                        </a>
                      </div>
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
              <div className="lg:hidden justify-center pt-5 pb-8 items-center mt-0 fixed bottom-[24px] left-0 w-full z-50">
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
                    {/* Only show drawer trigger for single markets */}
                    {markets?.length <= 1 && (
                      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger className="w-full py-2 font-semibold bg-black border-t border-[#1E1E1E] text-black rounded-lg mt-10">
                          <div className="flex items-center justify-between gap-2.5 w-full px-4 mt-0">
                            <div className="flex-1 !bg-[#0D1A26] rounded-lg h-10 text-[#7DFDFE] text-base font-medium leading-tight inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                              Yes
                              {markets?.length === 1 && (
                                <span className="ml-0 pl-0 text-xl text-[#7DFDFE] font-semibold">
                               {getLowestAskPrice(markets[0]?._id) !== null && getLowestAskPrice(markets[0]?._id) !== undefined ? `${getLowestAskPrice(markets[0]?._id)}¢` : '--'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 !bg-[#210D1A] rounded-lg h-10 text-[#EC4899] text-base font-medium leading-tight inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                              No
                              {markets?.length === 1 && (
                                <span className="ml-0 pl-0 text-xl text-[#EC4899] font-semibold">
                               {getHighestBidPrice(markets[0]?._id) !== null && getHighestBidPrice(markets[0]?._id) !== undefined ? `${getHighestBidPrice(markets[0]?._id)}¢` : '--'}
                                </span>
                              )}
                            </div>
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
                    )}
                    
                    {/* Drawer for multiple markets - controlled by accordion buttons */}
                    {markets?.length > 1 && (
                      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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
                    )}
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
      {/* Discord Community Section - Mobile only at bottom */}
      <div className="flex sm:hidden w-full max-w-7xl mx-auto mt-5 mb-5 justify-center">
        <div
          className="bg-black rounded-md px-4 py-5 flex flex-col items-center w-full max-w-xs border border-[#222] shadow-sm gap-2"
          style={{ boxShadow: '0 2px 6px 0 rgba(220,220,255,0.13)' }}
        >
          <h3 className="text-base font-bold mb-1 text-white">Join our Discord community</h3>
          <p className="text-xs text-gray-300 mb-2 text-center">Connect with other traders, get support, and stay up to date with the latest news and features.</p>
          <a
            href="https://discord.com/invite/sonotrade"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-2 py-2 rounded-md transition-colors duration-200 text-xs flex items-center gap-1"
          >
            <img src="/images/discordnew.png" alt="Discord" width={16} height={16} className="mr-1" />
            Join Discord
          </a>
        </div>
      </div>
      <Footer />
      <HeaderFixed />
    </>
  );
}
