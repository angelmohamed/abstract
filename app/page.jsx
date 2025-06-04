"use client";

import { Button } from "@/app/components/ui/button";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import "./globals.css";
import Header from "./Header";
import { NavigationBar } from "@/app/components/ui/navigation-menu";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/app/components/ui/carousel";
import EventLinting from "@/app/components/customComponents/EventLinting";
import SlideshowLinting from "@/app/components/customComponents/SlideshowLinting";
import { infoCards } from "@/app/components/constants";
import { getCategories } from "@/services/market";

const InfoCards = () => {
  const cards = infoCards;

  const renderInfoCard = (emoji, title, footer) => {
    return (
      <div className="h-full border border-white p-4 rounded-md">
        <div className="flex">
          <h3 className="text-3xl font-semibold mb-2">{emoji}</h3>
          <p className="text-sm font-extrabold pl-2">{title}</p>
        </div>
        <div>
          <p className="text-sm pt-3">{footer}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center mb-8 mt-8 pt-2 pb-8">
      <div className="w-full">
        {/* Desktop view */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {cards && cards?.length > 0 && cards?.map((card, index) => (
            <div key={index}>
              {renderInfoCard(card.emoji, card.title, card.footer)}
            </div>
          ))}
        </div>

        {/* Mobile view with carousel */}
        <div className="md:hidden">
          <Carousel className="w-full">
            <CarouselContent>
              {cards && cards?.length > 0 && cards?.map((card, index) => (
                <CarouselItem key={index} className="pl-4">
                  {renderInfoCard(card.emoji, card.title, card.footer)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white" />
            <CarouselNext className="text-white" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [selectCategory, setSelectedCategory] = useState("all");
  const [categoryList, setCategoryList] = useState([]);
  const [showClosed, setShowClosed] = useState(false);
  const [navigationItems, setNavigationItems] = useState([]);

  const fetchCategories = async () => {
    try {
      const { success, result } = await getCategories();
      if (success) {
        setCategoryList(result);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { success, result } = await getCategories();
      if (success) {
        setNavigationItems(result);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  }

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
        <Header />
        {/* <NavigationBar menuItems={navigationItems} showLiveTag={true} /> */}
      </div>

      <div className="container mx-auto px-4 max-w-full overflow-hidden">
        <SlideshowLinting />

        {/* Info Cards Section */}
        <InfoCards />

        {/* <div>
          <div className="flex justify-center pb-5 sm:pt-4 pt-0 items-center">
            <div className="w-full">
              <div className="flex justify-center gap-2 sm:gap-4">
                {" "}
                <Button
                  className={cn(
                    selectCategory === "all"
                      ? "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-blue-500 w-[100px] sm:w-[130px]" // Narrower on mobile
                      : "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-[#131212] w-[100px] sm:w-[130px]" // Narrower on mobile
                  )}
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                {
                  categoryList?.map((category) => (
                    <Button
                      key={category.slug}
                      className={cn(
                        selectCategory === category.slug
                          ? "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-blue-500 w-[100px] sm:w-[130px]" // Narrower on mobile
                          : "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-[#131212] w-[100px] sm:w-[130px]" // Narrower on mobile
                      )}
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.title}
                    </Button>
                  ))
                }
              </div>
            </div>
          </div>
        </div> */}

        {/* Event Cards Section */}
        <div className="flex pb-6 mt-8 justify-center w-full">
          <div className="w-full">
            <EventLinting
              selectCategory={selectCategory}
              showClosed={showClosed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
