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
import SlideshowLinting from "@/app/components/customComponents/SlideshowLinting";
// import { infoCards } from "@/app/components/constants";
import { getCategories, getTagsByCategory } from "@/services/market";
import { getInfoCards } from "@/services/user";
import { Footer } from "./components/customComponents/Footer";
import { ScrollArea } from "radix-ui";
import { useSearchParams } from "next/navigation";
import { isEmpty } from "@/lib/isEmpty";
import DiscordLogo from "@/public/images/discordnew.png";

const InfoCards = ({ infoCardCms }) => {

  const renderInfoCard = (emoji, title, footer) => {
    return (
      <div className="h-28 p-3 rounded-md" style={{ backgroundColor: '#00111a', height: '7rem' }}>
        <div className="flex items-center">
          <h3 className="text-xl font-semibold mb-1">{emoji}</h3>
          <p className="text-xs font-bold pl-2 leading-tight">{title}</p>
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
      <div className="justify-center mb-4 mt-2 pt-0 w-full flex">
        <div className="w-full flex flex-col items-center justify-center">
          {/* Desktop view */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 justify-items-center items-center">
            {infoCardCms &&
              infoCardCms?.length > 0 &&
              infoCardCms?.map((card, index) => (
                <div key={index}>
                  {renderInfoCard(card.emoji, card.title, card?.content)}
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
                      {renderInfoCard(card.emoji, card.title, card?.content)}
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
              ? "text-[#7dfdfe] bg-[#0d1a26] border-[#7dfdfe]"
              : "text-muted-foreground border-[#222] bg-black hover:text-gray-300"
          )}
          onClick={() => setSelectedSubcategory("all")}
        >
          For You
        </Button>
        {subcategories?.map((subcategory) => (
          <Button
            key={subcategory.slug}
            className={cn("px-3 py-1 h-[30px] rounded-md transition-colors text-sm font-medium whitespace-nowrap border-[1px] hover:bg-transparent",
              selectedSubcategory === subcategory.slug
                ? "text-[#7dfdfe] bg-[#0d1a26] border-[#7dfdfe]"
                : "text-muted-foreground border-[#222] bg-black hover:text-gray-300"
            )}
            onClick={() => setSelectedSubcategory(subcategory.slug)}
          >
            {subcategory.title}
          </Button>
        ))}
      </div>
      {/* Right fade overlay positioned at the edge of the scroll area */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-black to-transparent">
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
      <div className="text-white bg-black h-auto items-center justify-items-center p-0 m-0">
        <div className="sticky top-0 z-50 w-[100%] backdrop-blur-md border-b border-[#222] lg:mb-4 mb-0" style={{ borderBottomWidth: '1px' }}>
          <Header />
          <NavigationBar
            menuItems={categories}
            showLiveTag={true}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectCategory}
          />
        </div>

        <div className="container mx-auto px-4 max-w-full overflow-hidden">
          <SubcategoryBar
            subcategories={subcategoryList}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
          />
          {
            isEmpty(categoryParam) && (
              <>
                <SlideshowLinting />
                {/* Info Cards Section */}
                <InfoCards infoCardCms={infoCardCms} />
              </>
            )
          }

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
            <div className="bg-black rounded-md px-6 py-8 flex flex-col items-center w-full max-w-xl border border-[#222] shadow-sm gap-2" style={{ boxShadow: '0 2px 6px 0 rgba(220,220,255,0.13)' }}>
              <h3 className="text-xl font-bold mb-1 text-white">Join our Discord community</h3>
              <p className="text-gray-300 mb-2 text-center text-sm">Connect with other traders, get support, and stay up to date with the latest news and features.</p>
              <a href="https://discord.com/invite/sonotrade" target="_blank" rel="noopener noreferrer" className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold px-2 py-2 rounded-md transition-colors duration-200 text-sm flex items-center gap-1">
                <Image src={DiscordLogo} alt="Discord" width={20} height={20} className="mr-1" />
                Join Discord
              </a>
            </div>
          </div>

        </div>
      </div>
      <Footer />
      <HeaderFixed />
    </>
  );
}
