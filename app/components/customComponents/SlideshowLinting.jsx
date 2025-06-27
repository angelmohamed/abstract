"use client";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselPagination } from "@/app/components/ui/carousel";
import { ImageCard } from "@/app/components/ui/imageCard";
import { ImageCardMultiple } from "@/app/components/ui/imageCardMultiple";
import { PreviewCard } from "@/app/components/ui/previewCard";

import KanyePitchfork from "@/public/images/kanyepitchfork.png";
import Oscars from "@/public/images/oscars.png";
import Travis from "@/public/images/concert1.png";
import AsapTrial from "@/public/images/asaptrial.png";
import { getEvents } from "@/services/market";


export default function EventCarousel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Array of background images
  const backgroundImages = [KanyePitchfork, Oscars, Travis, AsapTrial];

  useEffect(() => {
    // Check if the screen width is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's `sm` breakpoint
    };

    // Set initial mobile state
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { success, result } = await getEvents({id:"all",limit:10,page:1,banner:"active"})
        if(success){
          setEvents(result?.data || []);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen overflow-hidden pb-10">
      <Carousel autoPlayInterval={8000}>
        <CarouselContent>
          {events?.map((event, index) => {
            const mainMarket = event.marketId?.[0] || {};
            const outcomePrices = mainMarket?.outcomePrices
              ? JSON.parse(mainMarket.outcomePrices)
              : [50, 50];

            // Skip PreviewCard on mobile
            if (isMobile && index % 3 === 2) {
              return null; // Skip rendering this item
            }

            // Select background image based on index
            const backgroundImage = backgroundImages[index % 3];

            return (
              <CarouselItem key={event?._id}>
              {(() => {
                const imageIndex = index % backgroundImages.length; // Ensure it cycles through 3 images
                const backgroundImage = backgroundImages[imageIndex]?.src || "/images/travis.png";
            
                return event.marketId?.length > 1 ? (
                  <ImageCardMultiple
                    eventID={event.slug}
                    backgroundImage={event.bannerImage || "/images/travis.png"}
                    imageSrc={event.image || "/images/travis.png"}
                    question={event.title}
                    totalPool={(
                      event.marketId 
                      ? event.marketId?.reduce((acc, mark) => acc + (mark.volume || 0) , 0) 
                      : 0)}
                    options={event.marketId}
                    forecast={event?.forecast}
                  />
                // ) : index % 3 === 2 ? (
                //   <PreviewCard
                //     endDate={event.endDate}
                //     eventID={event.slug}
                //     eventImageSrc={event.bannerImage || "/images/travis.png"}
                //     question={event.title}
                //     probability={event.marketId[0]?.last}
                //     totalPool={`$${(
                //       event.volume
                //         ? event.volume.toLocaleString(undefined, {
                //             minimumFractionDigits: 2,
                //             maximumFractionDigits: 2,
                //           })
                //         : "0.00"
                //     )}`}
                //     yesPotential={outcomePrices[0] || 50}
                //     noPotential={outcomePrices[1] || 50}
                //     className="max-w-7xl mx-auto" // 添加容器样式
                //     style={{ height: "510px" }} // 与其他卡片背景容器保持一致的高度
                //   />
                ) : (
                  <ImageCard
                    eventID={event.slug}
                    backgroundImage={event.bannerImage || event.image}
                    eventImageSrc={event.image || "/images/travis.png"}
                    question={event.title}
                    probability={event.marketId[0]?.last}
                    totalPool={`$${(
                      event.marketId?.[0]?.volume
                        ? (event.marketId?.[0]?.volume/100).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00"
                    )}`}
                    yesPotential={outcomePrices[0] || 50}
                    noPotential={outcomePrices[1] || 50}
                  />
                );
              })()}
            </CarouselItem>
            
            );
          })}
        </CarouselContent>
        <CarouselPagination />
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}