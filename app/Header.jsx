"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SearchBar from "@/app/components/ui/SearchBar";
import Authentication from "./Authentication.jsx";
import SONOTRADE from "@/public/images/logo.png";

import { useSelector } from "@/store";
import { availableBalance } from "@/lib/utils";
import { getCategories, getEventsByRegex } from "@/services/market.ts";

export default function Header() {
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectCategory, setSelectCategory] = useState("");
  const [filterEvent, setFilterEvent] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isRecentActivity, setIsRecentActivity] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  const { signedIn } = useSelector((state) => state?.auth?.session);
  const walletData = useSelector((state) => state?.wallet?.data);

  const navigateToPortfolioPage = () => router.push("/portfolio");

  const fetchFilterEvent = useCallback(async (query) => {
    try {
      const reqData = {
        regex: query,
        page: 1,
        limit: 10,
        category: selectCategory,
      };
      const { success, result } = await getEventsByRegex(reqData);
      if (success) {
        setIsRecentActivity(false);
        setFilterEvent(result);
      }
    } catch (error) {
      console.error("Error fetching filter events:", error);
    }
  }, []);

  const fetchCategoryList = useCallback(async () => {
    try {
      const { success, result } = await getCategories();
      if (success) setCategoryList(result);
    } catch (error) {
      console.error("Error fetching category list:", error);
    }
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setFilterEvent([]);
      setIsSearchActive(true);
      // setIsSearchActive(false);
    } else {
      setIsSearchActive(true);
    }
  };

  //when i click the event , data stored in local storage
  const clickEvent = (event) => {
    const eventPath = `/event-page/${event.slug}`;
    console.log("router.asPath", router.asPath);
    // if (router.asPath === eventPath) {
    //   // Already on the event page, no need to push
    //   alert("you are already in the page")
    //   return;
    // }
    setRecentActivity((prev) => {
      const updatedActivity = [event, ...prev];
      if (updatedActivity.length > 5) {
        updatedActivity.pop();
      }
      localStorage.setItem("eventData", JSON.stringify(updatedActivity));
      return updatedActivity;
    });
    router.push(`/event-page/${event.slug}`);
  };

  const ClearRecentActivity = (event) => {
    setRecentActivity((prev) => {
      const updatedActivity = prev.filter((item) => item._id !== event._id);
      localStorage.setItem("eventData", JSON.stringify(updatedActivity));
      return updatedActivity;
    });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery) fetchFilterEvent(debouncedQuery);
  }, [debouncedQuery, fetchFilterEvent]);

  useEffect(() => {
    fetchCategoryList();
    const storedActivity = localStorage.getItem("eventData");
    if (storedActivity) {
      setRecentActivity(JSON.parse(storedActivity));
    }
  }, []);

  return (
    <header className="flex flex-col md:flex-row items-center w-full bg-transparent md:h-16 pt-2 container mx-auto">
      {/* Logo and Mobile Auth */}
      <div className="flex w-full md:w-auto items-center justify-between md:ml-6">
        <Link href="/">
          <Image
            src={SONOTRADE}
            alt="SONOTRADE Logo"
            width={265}
            className="w-48 md:w-64 pl-3 md:pl-0"
            priority
          />
        </Link>

        <div className="flex md:hidden items-center gap-2 pr-3">
          {signedIn && (
            <button
              className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
              onClick={navigateToPortfolioPage}
            >
              <div className="text-l text-[#33ff4c]">
                ${availableBalance(walletData)}
              </div>
              <div className="text-xs text-grey">Cash</div>
            </button>
          )}
          <Authentication />
        </div>
      </div>

      {/* Search Section */}
      <div className="w-full px-4 pb-2 md:pb-0 md:px-[2%] mt-1 md:mt-0 hidden lg:block">
        <div
          className={`relative lg:max-w-[600px] min-w-[300px] sm:min-w-[400px]`}
          tabIndex={-1}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setIsSearchActive(false)}
        >
          <SearchBar
            placeholder="Search events"
            onChange={handleInputChange}
            className={`w-full transition-all duration-150 outline-none ${
              isSearchActive ? "rounded-t-lg rounded-b-none" : "rounded-lg"
            }`}
          />
          {isSearchActive && (
            <div className="absolute left-0 right-0 bg-[#070707] z-[156] rounded-b-lg border border-[#262626] border-t-0">
              <div className="flex flex-col gap-2 p-3">
                <div className="flex flex-col pb-2 gap-2">
                  <p className="text-sm font-medium ">Browse</p>
                  <div className="flex gap-2 flex-wrap">
                    {categoryList.length !== 0 &&
                      categoryList.map(({ slug, title, _id }) => (
                        <p
                          key={_id}
                          className="border cursor-pointer rounded-md px-2 text-sm"
                          onClick={() => router.push(`/?category=${slug}`)}
                        >
                          {title}
                        </p>
                      ))}
                  </div>
                </div>

                {isRecentActivity && (
                  <div className="flex flex-col pb-2 gap-2">
                    <p className="text-sm font-medium ">Recent</p>
                    <div className="flex flex-col gap-2">
                      {recentActivity.length === 0 ? (
                        <p className="text-sm text-center text-gray-500">
                          No recent activity found
                        </p>
                      ) : (
                        recentActivity.map((event, index) => (
                          <div
                            key={index}
                            className="py-2 rounded-lg border flex items-center justify-between gap-2 hover:bg-[#262626] pl-2 pr-3 cursor-pointer"
                            onClick={() =>
                              router.push(`/event-page/${event.slug}`)
                            }
                          >
                            <div className="flex items-center gap-2">
                              {event.image ? (
                                <Image
                                  src={event.image}
                                  alt="Event"
                                  width={30}
                                  height={30}
                                  className="rounded"
                                />
                              ) : (
                                <div className="w-[30px] h-[30px] bg-gray-700 rounded" />
                              )}
                              <span className="text-sm">
                                {event.title || "Untitled Event"}
                              </span>
                            </div>
                            {/* <button
                                  aria-label="Close"
                                  onClick={() =>ClearRecentActivity(event)}
                                >
                                  <Cross2Icon className="h-4 w-4" />
                                </button> */}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {!isRecentActivity && (
                  <div className="flex flex-col pb-2 gap-2">
                    <p className="text-sm font-medium ">Events</p>
                    <div className="flex flex-col gap-2">
                      {filterEvent.length === 0 ? (
                        <div>
                          <p className="text-sm text-center text-gray-500">
                            No events found
                          </p>
                        </div>
                      ) : (
                        filterEvent.map((event, index) => (
                          <div
                            key={index}
                            className="py-2 rounded-lg border flex items-center justify-between gap-2 hover:bg-[#262626] pl-2 pr-3 cursor-pointer"
                            onClick={() => clickEvent(event)}
                          >
                            <div className="flex items-center gap-2">
                              {event.image ? (
                                <Image
                                  src={event.image}
                                  alt="Event"
                                  width={30}
                                  height={30}
                                  className="rounded"
                                />
                              ) : (
                                <div className="w-[30px] h-[30px] bg-gray-700 rounded" />
                              )}
                              <span className="text-sm">
                                {event.title || "Untitled Event"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-2 ml-auto pr-3">
        {signedIn && (
          <button
            className="px-3 py-2 hover:bg-gray-800 rounded-md transition-colors"
            onClick={navigateToPortfolioPage}
          >
            <div className="text-l text-[#33ff4c]">
              ${availableBalance(walletData)}
            </div>
            <div className="text-xs text-grey">Cash</div>
          </button>
        )}
        <Authentication />
      </div>
    </header>
  );
}
