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

interface ChartDataPoint {
  timestamp: string;
  asset1: number;
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
  volume?: string;
  endDate?: string;
  image: any;
  customData: ChartDataPoint[];
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
        {payload.map(
          (entry, index) =>
            entry.value !== null && (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.value}M listeners
              </p>
            )
        )}
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
  customData,
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

  // State to track screen width
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Update screen width on resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Show every 2nd label for weekly data to avoid overcrowding
  const xAxisInterval = 1;

  useEffect(() => {
    if (customData && customData.length > 0) {
      setChartData(customData);
      // Set initial value to the latest data point
      setCurrentListeners(customData[customData.length - 1].asset1);
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
      setCurrentListeners(customData[customData.length - 1].asset1);
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
                  width: screenWidth < 640 ? "50px" : "75px",
                  height: screenWidth < 640 ? "50px" : "75px",
                  overflow: "hidden",
                  borderRadius: "10px",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={image}
                  alt="Artist"
                  width={screenWidth < 640 ? 50 : 75}
                  height={screenWidth < 640 ? 50 : 75}
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    transition: "all 0.3s ease" 
                  }}
                />
              </div>
              <div
                className="text-[22px] lg:text-[26px] sm:text-[20px]"
                style={{ paddingLeft: "15px", marginRight: "10px" }}
              >
                {title || "Forecast"}
              </div>
            </div>
          </CardTitle>
          
          {/* Volume and Date info */}
          <CardDescription className="py-2 flex flex-col sm:flex-row sm:gap-3 gap-1 justify-start items-start sm:items-center">
            <div className="flex flex-wrap gap-3 items-center">
              <p>Vol ${volume || ""}</p>
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
                  {currentListeners.toFixed(1)}M
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
                      dataKey="timestamp"
                      interval={xAxisInterval}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={100}
                    />
                    <YAxis
                      domain={[80, 100]}
                      tickFormatter={(tick) => `${tick}M`}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      orientation="right"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="natural"
                      dataKey="asset1"
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
                {albumReleases && albumReleases.map((album, index) => {
                  const dateIndex = chartData.findIndex(data => data.timestamp === album.date);
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
                })}
              </div>
            </CardContent>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MonthlyListenersChart; 