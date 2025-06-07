"use client";

import React, { useEffect, useState } from "react";
import Ye from "/public/images/Ye.png";
// import Polymarket from "/public/images/polymarket.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRightLeft, Clock } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/app/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  processSingleChartData,
  ChartDataPoint,
} from "@/utils/processChartData";
import { toTwoDecimal } from "@/utils/helpers";
import { HoverCard } from "radix-ui";
import { CountdownTimerIcon } from "@radix-ui/react-icons";

interface MarketData {
  clobTokenIds: string;
  [key: string]: any;
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

interface SingleLineChartProps {
  title?: string;
  volume?: number;
  endDate?: string;
  image: any;
  market: MarketData[];
  interval: string;
  chance?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-transparent p-2 border border-transparent rounded shadow text-white">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map(
          (entry, index) =>
            entry.value !== null && (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name} {entry.value?.toFixed(1)}¢
              </p>
            )
        )}
      </div>
    );
  }
  return null;
};

const SingleLineChart: React.FC<SingleLineChartProps> = ({
  title,
  volume,
  endDate,
  image,
  market,
  interval,
  chance,
}) => {
  const [chartDataYes, setChartDataYes] = useState<ChartDataPoint[]>([]);
  const [chartDataNo, setChartDataNo] = useState<ChartDataPoint[]>([]);
  const [selectedYes, setSelectedYes] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    asset1: {
      label: "Yes",
      color: "#27ae60",
    },
  });

  const [hoveredChance, setHoveredChance] = useState<number | undefined>(
    undefined
  );

  // State to track screen width
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Update screen width on resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Determine X-axis interval based on screen width
  const xAxisInterval =
    screenWidth < 640
      ? Math.floor(chartData.length / 6)
      : Math.floor(chartData.length / 12);

  useEffect(() => {
    if (selectedYes) {
      setChartData(chartDataYes);
      setChartConfig({
        asset1: { label: "Yes", color: "#27ae60" },
      });
    } else {
      setChartData(chartDataNo);
      setChartConfig({ asset1: { label: "No", color: "#e64800" } });
    }
  }, [selectedYes, chartDataYes, chartDataNo]);

  useEffect(() => {
    const fetchAllPriceHistories = async () => {
      if (market && market.length > 0) {
        const yes = market?.[0]?.clobTokenIds ? JSON.parse(market?.[0]?.clobTokenIds || "")[0] : "";
        const no = market?.[0]?.clobTokenIds ? JSON.parse(market?.[0]?.clobTokenIds || "")[1] : "";
        try {
          // const response = await fetch(
          //   `/api/event-data/price-history?interval=${interval}&market=${yes}&fidelity=${30}`,
          //   {
          //     method: "GET",
          //     headers: {
          //       "Content-Type": "application/x-www-form-urlencoded",
          //     },
          //   }
          // );
          // const data = await response.json();
          const data = {
            history:[]
          }
          setChartDataYes(processSingleChartData(data.history, interval));
        } catch (error) {
          console.error("Error fetching PriceHistory:", error);
        }
        try {
          // const response = await fetch(
          //   `/api/event-data/price-history?interval=${interval}&market=${no}&fidelity=${30}`,
          //   {
          //     method: "GET",
          //     headers: {
          //       "Content-Type": "application/x-www-form-urlencoded",
          //     },
          //   }
          // );
          // const data = await response.json();
          const data = {
            history:[]
          }
          setChartDataNo(processSingleChartData(data.history, interval));
        } catch (error) {
          console.error("Error fetching PriceHistory:", error);
        }
      }
    };
    fetchAllPriceHistories();
  }, [market, interval]);

  // Calculate the current displayed chance value and color
  const displayChance =
    hoveredChance !== undefined
      ? hoveredChance
      : selectedYes
      ? chance
      : chance !== undefined
      ? 1 - chance
      : undefined;
  const chanceColor = selectedYes ? "#27ae60" : "#e64800";
  const [activeDate, setActiveDate] = useState("Jun 18");
  return (
    <Card
      className="h-auto" // Wider on mobile
      style={{ backgroundColor: "transparent", borderColor: "transparent" }}
    >
      <div>
        <CardHeader className="p-0">
          {/* 先显示标题 */}
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

          {/* 显示 Vol 和时间等信息 */}
          <CardDescription className="py-2">
            {/* First line - Volume and Date */}
            <div className="flex flex-wrap gap-3 items-center">
              <p>Vol ${(volume && toTwoDecimal(volume)?.toLocaleString()) || "0.00"}</p>
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

            {/* Second line (mobile) - Polymarket and Swap Button */}
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                onClick={() => setSelectedYes(!selectedYes)}
              >
                <ArrowRightLeft />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <HoverCard.Root>
                <HoverCard.Trigger asChild>
                  <Button className="w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] active:bg-[#262626] active:text-[#fff]">
                    <CountdownTimerIcon />
                  </Button>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                  <HoverCard.Content className="history_card" sideOffset={5}>
                    <ul className="history_card_list">
                      <li>Ended: May 7, 2025</li>
                      <li>Ended: March 19, 2025</li>
                    </ul>
                    <HoverCard.Arrow className="HoverCardArrow" />
                  </HoverCard.Content>
                </HoverCard.Portal>
              </HoverCard.Root>
              <Button
                // className="w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] active:bg-[#262626] active:text-[#fff]"
                className={`w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] ${
                  activeDate === "Jun 18"
                    ? "bg-[#fff] text-[#262626] border-[#262626]"
                    : ""
                }`}
                onClick={() => setActiveDate("Jun 18")}
              >
                Jun 18
              </Button>
              <Button className="w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] active:bg-[#262626] active:text-[#fff]">
                Jul 30
              </Button>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="gap-0 sm:gap-2 p-0">
          <div className="w-full test">
            <CardHeader className="sm:pb-4 p-0 mt-3">
              {displayChance !== undefined && (
                <div className="flex justify-start mb-4">
                  {" "}
                  {/* Changed from justify-center to justify-start */}
                  <CardTitle
                    className="text-4xl"
                    style={{ color: chanceColor }}
                  >
                    <span>{(displayChance * 100).toFixed(1)}%</span>
                    <span className="text-2xl font-light"> chance</span>
                  </CardTitle>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ChartContainer
                className="h-[350px] lg:h-[300px] sm:h-[200px] w-full" // Shorter on mobile
                config={chartConfig}
              >
                <LineChart
                  data={chartData}
                  onMouseMove={(e) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      const hoveredValue = e.activePayload[0].value;
                      setHoveredChance(hoveredValue / 100); // Convert to percentage
                    }
                  }}
                  onMouseLeave={() => setHoveredChance(undefined)}
                >
                  <XAxis
                    dataKey="timestamp"
                    interval={xAxisInterval} // Dynamic interval based on screen width
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={100}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(tick) => `${tick}%`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    orientation="right"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ top: "-10px" }}
                  />
                  {["asset1"].map((asset, _) => (
                    <Line
                      key={asset}
                      type="natural"
                      dataKey={asset}
                      name={chartConfig[asset].label}
                      stroke={selectedYes ? "#27ae60" : "#e64800"}
                      strokeWidth={2}
                      dot={false}
                      label={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            </CardContent>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SingleLineChart;
