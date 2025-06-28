"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Clock } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/app/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { toTwoDecimal } from "@/utils/helpers";
import { getForecastHistory } from "@/services/market";
import { momentFormat } from "@/app/helper/date";

interface ChartDataPoint {
  createdAt: string;
  forecast: number;
}

interface AlbumRelease {
  date: string;
  title: string;
  cover: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    [key: string]: any;
  }>;
  label?: string;
}

interface MonthlyListenersChartProps {
  title?: string;
  volume?: number;
  endDate?: string;
  image: any;
  eventId?: any;
  eventSlug?: any;
  interval?: any;
  // customData: ChartDataPoint[];
  albumReleases?: AlbumRelease[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-transparent p-2 border border-transparent rounded shadow text-white">
        <p className="text-sm font-semibold">{label || "Forecast"}</p>
        {/* {payload.map(
          (entry, index) =>
            entry.value !== null && (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.value?.toFixed(1)}% listeners
              </p>
            )
        )} */}
      </div>
    );
  }
  return null;
};

const MonthlyListenersChart: React.FC<MonthlyListenersChartProps> = ({
  title,
  volume,
  endDate,
  image,
  eventId,
  eventSlug,
  interval,
  // customData,
  albumReleases,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentListeners, setCurrentListeners] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [chartConfig] = useState<ChartConfig>({
    asset1: {
      label: "Forecast",
      color: "#7DFDFE",
    },
  });
  const [customData, setCustomData] = useState<ChartDataPoint[]>([])

  // State to track screen width
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const getIntervalDate = (interval: string) => {
    const now = new Date();
    switch (interval) {
      case "1h":
        return new Date(now.setHours(now.getHours() - 1)).getTime();
      case "6h":
        return new Date(now.setHours(now.getHours() - 6)).getTime();
      case "1d":
        return new Date(now.setDate(now.getDate() - 1)).getTime();
      case "1w":
        return new Date(now.setDate(now.getDate() - 7)).getTime();
      case "1m":
        return new Date(now.setMonth(now.getMonth() - 1)).getTime();
      case "max":
        return new Date(now.setFullYear(now.getFullYear() - 1)).getTime();
      default:
        return new Date(now.setDate(now.getDate() - 30)).getTime(); // Default to 30 days
    }
  }

  const fetchData = async () => {
      try {
          let startDate = getIntervalDate(interval);
          let end_ts = new Date().getTime();
          const data = {
              // market: selectedYes ? "yes" : "no",
              // interval,
              // fidelity: 30
              start_ts:startDate,
              end_ts:end_ts
          }
          const { success, result } = await getForecastHistory(eventSlug, data);
          if (success) {
            if(!result || result.length === 0) {
              setCustomData([]);
            }else{
              let formettedData = result.map((item:any)=>{
                let formetTime;
                if(["1h","6h","1d"].includes(interval)){
                  formetTime = momentFormat(item.createdAt, "YYYY-MM-DD HH:mm");
                }else if(interval === "1w"){
                  formetTime = momentFormat(item.createdAt, "YYYY-MM-DD");
                }else{
                  formetTime = momentFormat(item.createdAt, "YYYY-MM-DD");
                }
                return {
                  createdAt:formetTime,
                  forecast: item.forecast * 100
                }
              })
              setCustomData(formettedData)
            }
          }
      } catch (error) {
          console.log(error);
      }
  };

  useEffect(() => {
    fetchData()
  },[eventSlug,interval])
  // Update screen width on resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Show every 2nd label for weekly data to avoid overcrowding
  const xAxisInterval =
        screenWidth < 640
            ? Math.floor(chartData.length / 30)
            : Math.floor(chartData.length / 30);
  useEffect(() => {
    if (customData && customData.length > 0) {
      setChartData(customData);
      // Set initial value to the latest data point
      setCurrentListeners(customData[customData.length - 1].forecast);
    }
  }, [customData]);

  const handleMouseEnter = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setCurrentListeners(data.activePayload[0].value);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Reset to latest value
    if (customData && customData.length > 0) {
      setCurrentListeners(customData[customData.length - 1].forecast);
    }
  };

  const handleAlbumClick = (album: AlbumRelease) => {
    console.log('Album clicked:', album.title);
    // You can add more functionality here like opening a modal or navigating
  };

  // Custom dot component that only shows on the last data point
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    const isLastPoint = index === chartData.length - 1;
    
    if (!isLastPoint) return null;
    
    return (
      <g>
        {/* Animated pulsing ring */}
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="none"
          stroke="#7DFDFE"
          strokeWidth={2}
          opacity={0.6}
        >
          <animate
            attributeName="r"
            values="4;12;4"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Main dot */}
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="#7DFDFE"
          stroke="#fff"
          strokeWidth={2}
        >
          <animate
            attributeName="r"
            values="4;5;4"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  };

  const AlbumBubble: React.FC<{ album: AlbumRelease; x: number; y: number }> = ({ album, x, y }) => (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={() => handleAlbumClick(album)}
    >
      <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden hover:scale-110 transition-transform">
        <Image
          src={album.cover}
          alt={album.title}
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-pink-500 bg-opacity-90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {album.title}
      </div>
    </div>
  );

  return (
    <Card
      className="h-auto" // Wider on mobile
      style={{ backgroundColor: "transparent", borderColor: "transparent" }}
    >
      <div>
        <CardHeader className="pt-0 pl-10 sm:pl-0 pb-0">
          {/* Title */}
          <CardTitle style={{ lineHeight: "1.5" }}>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                      <div
                                          style={{
                                              width: screenWidth < 640 ? "40px" : "40px",
                                              height: screenWidth < 640 ? "40px" : "40px",
                                              overflow: "hidden",
                                              borderRadius: "4px",
                                              flexShrink: 0,
                                          }}
                                      >
                                          <img
                                              src={image}
                                              alt="Event"
                                              width={screenWidth < 640 ? 40 : 40}
                                              height={screenWidth < 640 ? 40 : 40}
                                              style={{
                                                  width: "100%",
                                                  height: "100%",
                                                  objectFit: "cover",
                                                  transition: "all 0.3s ease",
                                              }}
                                          />
                                      </div>
                                      <div
                                          className="text-[18px] lg:text-[24px] sm:text-[16px]"
                                          style={{ paddingLeft: "15px", marginRight: "10px" }}
                                      >
                                          {title || ""}
                                      </div>
                                  </div>
                              </CardTitle>
          
          {/* Volume and Date info */}
          <CardDescription className="py-2 flex flex-col sm:flex-row sm:gap-3 gap-1 justify-start items-start sm:items-center">
            <div className="flex flex-wrap gap-3 items-center">
              <p>Vol ${(volume && toTwoDecimal(volume/100)?.toLocaleString(undefined,{ minimumFractionDigits: 2, maximumFractionDigits: 2 })) || "0.00"}</p>
              {endDate && (
                <p className="flex items-center gap-1">
                  <Clock size={14} />{" "}
                  {new Date(endDate)?.toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </p>
              )}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="gap-0 sm:gap-2 p-0 pl-2">
          <div className="w-full test">
            {/* Large Headline Number */}
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-bold text-white animate-pulse-subtle">
                  {currentListeners?.toFixed(1)}%
                </div>
                <div className="text-lg text-gray-400 mt-1 flex items-center justify-center gap-2">
                  <Image
                    src={"/images/spotifylogo.png"}
                    alt="Spotify"
                    width={20}
                    height={20}
                  />
                  Forecast
                </div>
              </div>
            </div>
            
            <CardContent className="p-0 sm:pl-0 pl-10 pr-8 sm:pr-0 pr-0">
              <div className="relative">
                <ChartContainer
                  className="h-[350px] p-0 pr-5 lg:h-[300px] sm:h-[200px] w-full" // Shorter on mobile
                  config={chartConfig}
                >
                  <LineChart 
                    data={chartData}
                    onMouseMove={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="createdAt"
                      // interval={5}
                      tickCount={5}
                      tickLine={false}
                      axisLine={false}
                      // tickMargin={10}
                      // minTickGap={100}
                      padding={"gap"}
                      hide
                    />
                    
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={(tick) => `${tick}%`}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="natural"
                      dataKey="forecast"
                      name="Forecast"
                      stroke="#7DFDFE"
                      strokeWidth={2}
                      dot={<CustomDot />}
                      label={false}
                      connectNulls
                    />
                  </LineChart>
                </ChartContainer>
                
                {/* Album Release Bubbles */}
                {/* {albumReleases && albumReleases.map((album, index) => {
                  const dateIndex = chartData.findIndex(data => data.createdAt === album.date);
                  if (dateIndex !== -1) {
                    const chartWidth = screenWidth < 640 ? screenWidth * 0.8 : screenWidth * 0.45;
                    const xPosition = (dateIndex / (chartData.length - 1)) * chartWidth + 40;
                    const yPosition = 320; // Position below the x-axis
                    
                    return (
                      <AlbumBubble
                        key={index}
                        album={album}
                        x={xPosition}
                        y={yPosition}
                      />
                    );
                  }
                  return null;
                })} */}
              </div>
            </CardContent>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MonthlyListenersChart; 