"use client";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Comment } from "@/app/components/ui/comment";
import MiniLineChart from "@/app/components/customComponents/MiniLineChart";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { getEventById } from "@/services/market";
import { ChartContainer } from "@/app/components/ui/chart";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
};

export function PreviewCard({
  eventID,
  eventImageSrc,
  question,
  probability,
  totalPool,
  endDate,
  className,
  style
}) {
  const [events, setEvents] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [interval, setInterval] = useState("all");
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [fontSize, setFontSize] = useState(26); // Default font size

  const router = useRouter();

  // Navigate to event page
  const handleCardClick = () => {
    router.push(`/event-page/${eventID}`);
  };

  // Fetch event data when eventID changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEventById({id: eventID});
        if(response.status) {
          setEvents(response.result);
          setMarkets(
            response.result?.marketId?.filter((market) => market.status === "active")
          );
        }
        setLoadingGraph(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoadingGraph(false);
      }
    };

    if (eventID) {
      fetchEvents();
    }
  }, [eventID]);

  if (!events) {
    return <div>Loading...</div>;
  }

  return (
    <Card 
      className={`max-w-7xl mx-auto ${className || ""}`} 
      style={{ 
        backgroundColor: "#161616", 
        position: 'relative', 
        zIndex: 1002,
        ...style 
      }}
    >
      <div className="flex" style={{ alignItems: "stretch", height: "100%" }}>
        {/* Left Div */}
        <div className="w-[35%] flex flex-col">
          <CardHeader>
            <CardTitle onClick={handleCardClick} style={{ lineHeight: "1.5", cursor: "pointer" }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{ 
                    width: "85px", 
                    height: "85px", 
                    overflow: "hidden", 
                    borderRadius: "11px", 
                    flexShrink: 0 
                  }}
                >
                  <Image 
                    src={eventImageSrc} 
                    alt="Event" 
                    width={85} 
                    height={85} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                <div
                  className="pl-5 flex items-center text-center"
                  style={{
                    fontSize: "min(26px, max(14px, 4vw))", // Scales based on available space
                    lineHeight: "1.7",
                    maxHeight: "85px",
                    maxWidth: "320px",
                    width: "100%",
                    height: "auto",
                    overflow: "hidden",
                    wordBreak: "break-word",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "flex-start"
                  }}
                >
                  {question}
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="pb-5">
              <Progress value={probability*100} className="w-[100%]" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="text-[12px]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48%' }}>
              <Button
                className="w-full mb-1 bg-[#1f3e2c] text-[#27ae60] hover:bg-[#e0e0e0] transition-colors duration-300 rounded-full"
                onClick={handleCardClick}
              >
                {markets?.[0]?.outcome?.[0]?.title || "Yes"} 24.0¢
              </Button>
            </div>

            <div className="text-[12px]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48%' }}>
              <Button
                className="w-full mb-1 bg-[#362020] text-[#e64800] hover:bg-[#e0e0e0] transition-colors duration-300 rounded-full"
                onClick={handleCardClick}
              >
                {markets?.[0]?.outcome?.[1]?.title || "No"} 76.0¢
              </Button>
            </div>

            </div>
          </CardContent>

          <CardFooter>
            <div>
              <Comment />
              <Comment />
              <Comment />
            </div>
          </CardFooter>
        </div>

        {/* Right Div */}
        <div className="w-[65%] flex flex-col overflow-hidden">
          <CardContent className="w-full" style={{ paddingTop: '16px' }}>
            {!loadingGraph ? (
              <ChartContainer className="h-[310px] w-full" config={chartConfig}>
                <MiniLineChart
                  title={probability}
                  volume={totalPool}
                  endDate={endDate}
                  market={markets}
                  interval={interval}
                />
              </ChartContainer>
            ) : (
              <div>Loading chart...</div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
