"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GIF from "/public/images/SONOTRADE.png";
import { Button } from "@/app/components/ui/button";
import EventCard from "@/app/components/ui/eventCard";
import { PreviewCard } from "@/app/components/ui/previewCard";
import React, { useState, useEffect } from "react";
import ConcertImage from "/public/images/concert1.png";
import { cn } from "@/lib/utils";
import "./globals.css";
import Header from "./Header";
import { NavigationBar } from "@/app/components/ui/navigation-menu";

import Grammy from "/public/images/grammys.png";
import { ImageCard } from "@/app/components/ui/imageCard";
import { MultipleOptionCard } from "@/app/components/ui/multipleOptionCard";
import { ImageCardMultiple } from "@/app/components/ui/imageCardMultiple";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/app/components/ui/navigation-menu";
import { Contrast } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import EventLinting from "@/app/components/customComponents/EventLinting";
import SlideshowLinting from "@/app/components/customComponents/SlideshowLinting";

import {
  chartPerformance,
  navigationItems,
  infoCards,
} from "@/app/components/constants";

const ListItem = ({ title, children }) => {
  return (
    <li>
      <div
        className={cn(
          "block select-none rounded-md p-3 leading-none transition-colors hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="text-sm leading-snug text-muted-foreground">{children}</p>
      </div>
    </li>
  );
};

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
    <div className="flex justify-center mb-8 mt-8 pt-2">
      <div className="w-full max-w-7xl">
        {/* Desktop view */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <div key={index}>
              {renderInfoCard(card.emoji, card.title, card.footer)}
            </div>
          ))}
        </div>

        {/* Mobile view with carousel */}
        <div className="md:hidden">
          <Carousel className="w-full">
            <CarouselContent>
              {cards.map((card, index) => (
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
  const [selectCategory, setSelectedCategory] = useState("music");
  const [showClosed, setShowClosed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State to toggle mobile dropdown

  return (
    <div className="text-white bg-black h-auto items-center justify-items-center font-[family-name:var(--font-geist-sans)] p-0 m-0">
      <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md">
        <Header />
        <NavigationBar menuItems={navigationItems} showLiveTag={true} />
      </div>

      <div className="container mx-auto px-4 max-w-full overflow-hidden">
        <SlideshowLinting />

        {/* Info Cards Section */}
        <InfoCards />

        <div>
          <div className="flex justify-center pb-5 sm:pt-4 pt-0 items-center">
            <div className="w-full max-w-7xl">
              {/* Category selection buttons */}
              <div className="flex justify-center gap-2 sm:gap-4">
                {" "}
                {/* Reduce gap on mobile */}
                <Button
                  className={cn(
                    selectCategory === "music"
                      ? "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-blue-500 w-[100px] sm:w-[130px]" // Narrower on mobile
                      : "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-[#131212] w-[100px] sm:w-[130px]" // Narrower on mobile
                  )}
                  onClick={() => setSelectedCategory("music")}
                >
                  Music
                </Button>
                <Button
                  className={cn(
                    selectCategory === "movies"
                      ? "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-blue-500 w-[100px] sm:w-[130px]" // Narrower on mobile
                      : "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-[#131212] w-[100px] sm:w-[130px]" // Narrower on mobile
                  )}
                  onClick={() => setSelectedCategory("movies")}
                >
                  Movies
                </Button>
                <Button
                  className={cn(
                    selectCategory === "awards"
                      ? "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-blue-500 w-[100px] sm:w-[130px]" // Narrower on mobile
                      : "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-[#131212] w-[100px] sm:w-[130px]" // Narrower on mobile
                  )}
                  onClick={() => setSelectedCategory("awards")}
                >
                  Awards
                </Button>
                <Button
                  className={cn(
                    showClosed
                      ? "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-red-600 w-[100px] sm:w-[130px]" // Narrower on mobile
                      : "text-white px-4 py-2 hover:bg-gray-800 transition duration-300 h-[95%] bg-green-500 w-[100px] sm:w-[130px]" // Narrower on mobile
                  )}
                  onClick={() => setShowClosed(!showClosed)}
                >
                  {showClosed ? "Closed" : "Open"}{" "}
                  {/* Shorten text on mobile */}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Cards Section */}
        <div className="flex pb-6 justify-center w-full">
          <div className="w-full max-w-7xl px-4">
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
