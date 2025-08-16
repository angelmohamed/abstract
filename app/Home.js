"use client";

import { Button } from "@/app/components/ui/button";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import "./globals.css";
import Header from "./Header";
import HeaderFixed from "./HeaderFixed";
import Image from "next/image";
import { NavigationBar } from "@/app/components/ui/navigation-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import EventLinting from "@/app/components/customComponents/EventLinting";
import { getCategories, getTagsByCategory } from "@/services/market";
import { getInfoCards } from "@/services/user";
import { Footer } from "./components/customComponents/Footer";
import { ScrollArea } from "radix-ui";
import { useSearchParams } from "next/navigation";
import { isEmpty } from "@/lib/isEmpty";
import DiscordLogo from "@/public/images/discordnew.png";
import Token from "@/public/images/token.png";
import Transfer from "@/public/images/spec.png";

const InfoCards = ({ infoCardCms }) => {

  const renderInfoCard = (title, footer) => {
    return (
      <div className="h-25 p-3 rounded-md" style={{ backgroundColor: '#c2ffbdff', height: '6rem' }}>
        <div className="flex items-center">
          <p className="text-xs font-bold pl-0 leading-tight">{title}</p>
        </div>
        <div>
          <p
            className="text-xs pt-2 leading-snug"
            dangerouslySetInnerHTML={{ __html: footer }}
          ></p>
        </div>
      </div>
    );
  };

  return (
    <div className="-mt-4 lg:block hidden">
      <div className="justify-center mb-5 mt-2 pb-4 pt-0 w-full flex">
        <div className="w-full flex flex-col items-center justify-center">

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 pt-3 mb-3">
  {/* First box - Buy backs */}
  <div style={{ backgroundColor: '#d3ffd0ff'}} className="relative rounded-md w-full h-60 bg-transparent flex items-center justify-center p-4 text-center overflow-hidden">
    {/* The glowing spinning border overlay */}
    <div className="absolute inset-0 rounded-md z-20 pointer-events-none opacity-100">
      <div className="absolute inset-0 rounded-md border border-[#0fdd00ff] animate-border-glow"></div>
      <div className="absolute inset-0 rounded-md animate-spin-slow">
        {/* Flowing lines */}
        <div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0fdd00ff] to-transparent animate-line-flow"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#0fdd00ff] to-transparent animate-line-flow-vertical"
          style={{ animationDelay: "0.7s" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0fdd00ff] to-transparent animate-line-flow"
          style={{ animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#0fdd00ff] to-transparent animate-line-flow-vertical"
          style={{ animationDelay: "1.7s" }}
        ></div>
      </div>
    </div>

    <div className="relative z-30 flex items-center space-x-4 max-w-full">
        {/* Text */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-2">The First-Ever Prediction Market that Pays its Community</h3>
          <p className="text-sm text-black">
           30% of platform transaction fees are allocated to strategic buybacks for token burns, reducing circulating supply to support the long-term value of the $SPEC ecosystem, creating value for those who actively participate and contribute insights.

          </p>
        </div>

        {/* Token Image */}
       <Image src={Token} alt="Token" width={150} height={150} className="mr-1" />
      </div>
    
        </div>

  {/* Second box - $SPEC token rewards */}
        <div className="relative rounded-md w-full h-60 bg-transparent flex items-center justify-center p-4 text-center overflow-hidden">
          {/* The glowing spinning border overlay */}
          <div style={{ backgroundColor: '#d3ffd0ff'}} className="absolute inset-0 border-[#0fdd00ff] rounded-md z-20 pointer-events-none opacity-100">
            <div className="absolute inset-0 rounded-md border border-[#00ff99] animate-border-glow"></div>
            <div className="absolute inset-0 rounded-md animate-spin-slow">
              {/* Flowing lines */}
              <div
                className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0fdd00ff] to-transparent animate-line-flow"
                style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#0fdd00ff] to-transparent animate-line-flow-vertical"
                    style={{ animationDelay: "0.7s" }}
                  ></div>
                  <div
                    className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#0fdd00ff] to-transparent animate-line-flow"
                    style={{ animationDelay: "1.2s" }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#0fdd00ff] to-transparent animate-line-flow-vertical"
                    style={{ animationDelay: "1.7s" }}
                  ></div>
                </div>
              </div>

             <div className="relative z-30 flex items-center space-x-4 max-w-full">
        {/* Text */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-2">Token-Level Rewards: Transfer Fee Redistribution to Holders</h3>
          <p className="text-sm text-black">
           50% of transfer fees are directly redistributed to $SPEC token holders as token-level rewards, fostering community loyalty and incentivizing sustained engagement within the ecosystem.
          </p>
        </div>

        {/* Token Image */}
       <Image src={Transfer} alt="Token" width={200} height={200} className="mr-1" />
      </div>
          
          </div>
        </div>


          <div className="hidden md:grid md:grid-cols-4 gap-4 justify-items-center items-center">
            {infoCardCms &&
              infoCardCms?.length > 0 &&
              infoCardCms?.map((card, index) => (
                <div key={index}>
                  {renderInfoCard(card.title, card?.content)}
                </div>
              ))}
          </div>

          {/* Mobile view with carousel */}
          <div className="md:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {infoCardCms &&
                  infoCardCms?.length > 0 &&
                  infoCardCms?.map((card, index) => (
                    <CarouselItem key={index} className="pl-4">
                      {renderInfoCard(card.title, card?.content)}
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className="text-white" />
              <CarouselNext className="text-white" />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubcategoryBar = ({
  subcategories,
  selectedSubcategory,
  setSelectedSubcategory,
}) => (
  <div className="justify-center items-center py-1 lg:flex hidden">
    <div className="w-full max-w-7xl relative">
      <div className="flex justify-start gap-2 sm:gap-3 overflow-x-auto flex-nowrap pb-5">
        <Button
          className={cn(
            "px-3 py-1 h-[30px] rounded-md transition-colors text-sm font-medium whitespace-nowrap border-[1px] hover:bg-transparent",
            selectedSubcategory === "all"
              ? "bg-[#e5ffe5] border-[#23eb00] text-black"
              : "border-[#e5e7eb] bg-white text-gray-700"
          )}
          onClick={() => setSelectedSubcategory("all")}
        >
          For You
        </Button>
        {subcategories?.map((subcategory) => (
          <Button
            key={subcategory.slug}
            className={cn(
              "px-3 py-1 h-[30px] rounded-md transition-colors text-sm font-medium whitespace-nowrap border-[1px] hover:bg-transparent",
              selectedSubcategory === subcategory.slug
                ? "bg-[#e5ffe5] border-[#23eb00] text-black"
                : "border-[#e5e7eb] bg-white text-gray-700"
            )}
            onClick={() => setSelectedSubcategory(subcategory.slug)}
          >
            {subcategory.title}
          </Button>
        ))}
      </div>
      {/* Right fade overlay positioned at the edge of the scroll area */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent">
      </div>
    </div>
  </div>
);

export default function Home({ infoCardCms, categories, tags }) {
  const [selectCategory, setSelectedCategory] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [subcategoryList, setSubcategoryList] = useState(tags);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const fetchTags = async () => {
    try {
      const { success, result } = await getTagsByCategory(selectCategory);
      if (success) {
        setSubcategoryList(result);
        setSelectedSubcategory("all");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [selectCategory]);

  return (
    <>
      <div className="text-black bg-white h-auto items-center justify-items-center p-0 m-0">
        <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md bg-white/90 border-b border-grey lg:mb-4 mb-0 text-black" style={{ borderBottomWidth: '0.5px' }}>
          <Header />
          <NavigationBar
            menuItems={categories}
            showLiveTag={true}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectCategory}
          />
        </div>

        <div className="container mx-auto px-0 sm:px-4 max-w-full overflow-hidden">
          <div className="px-1 sm:px-0">
            <SubcategoryBar
              subcategories={subcategoryList}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
            />
            {
              isEmpty(categoryParam) && (
                <>
                  {/* Info Cards Section */}
                  <InfoCards infoCardCms={infoCardCms} />
                </>
              )
            }

            {/* Event Cards Section */}
            <div className={"flex pb-6 justify-center w-full mt-0"}>
              <div className="w-full">
                <EventLinting
                  selectCategory={selectCategory}
                  showClosed={showClosed}
                  selectedSubcategory={selectedSubcategory}
                />
              </div>
            </div>

            {/* Discord Community Section */}
            <div className="w-full max-w-7xl mx-auto mt-5 mb-5 flex justify-center">
              <div
                className="bg-white rounded-md px-4 py-5 sm:px-6 sm:py-8 flex flex-col items-center w-full max-w-xs sm:max-w-xl border border-gray-200 shadow-sm gap-2"
                style={{ boxShadow: '0 2px 6px 0 rgba(220,220,255,0.13)' }}
              >
                <h3 className="text-base sm:text-xl font-bold mb-1 text-black">Join our Discord community</h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-2 text-center">Connect with other traders, get support, and stay up to date with the latest news and features.</p>
                <a
                  href="https://discord.com/invite/sonotrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-2 py-2 rounded-md transition-colors duration-200 text-xs sm:text-sm flex items-center gap-1"
                >
                  <Image src={DiscordLogo} alt="Discord" width={16} height={16} className="mr-1" />
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <HeaderFixed />
    </>
  );
}