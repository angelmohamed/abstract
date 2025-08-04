"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Clock } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/app/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { processSingleChartData, ChartDataPoint } from "@/utils/processChartData";
import { toTwoDecimal } from "@/utils/helpers";
import ChartIntervals from "@/app/components/customComponents/ChartIntervals";
import { getForecastHistory } from "@/services/market";

const getIntervalDate = (interval: string) => {
  const now = new Date();
  switch (interval) {
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000).getTime();
    case "6h":
      return new Date(now.getTime() - 6 * 60 * 60 * 1000).getTime();
    case "1d":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
    case "1w":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    case "1m":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
    case "all":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).getTime();
    default:
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).getTime();
  }
}

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

interface MultiListenersChart2Props {
  title?: string;
  volume?: number;
  endDate?: string;
  image: any;
  market: MarketData[];
  eventSlug: string;
  customData?: ChartDataPoint[];
  interval: string
}

function calculateYAxisDomain(data: any[], assetKey: string = 'asset1'): [number, number] {
  if (!data || data.length === 0) {
    console.log('calculateYAxisDomain: No data provided');
    return [0, 100];
  }
  
  // Find min and max values, filtering out null/undefined
  const values = data
    .map(d => d[assetKey])
    .filter(v => v !== null && v !== undefined && !isNaN(v));
  
  // console.log('calculateYAxisDomain: Raw values for', assetKey, ':', values.slice(0, 5), '... (total:', values.length, ')');
  
  if (values.length === 0) {
    // console.log('calculateYAxisDomain: No valid values found');
    return [0, 100];
  }
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Round min down to first whole 10 below, max up to first whole 10 above
  const roundedMin = Math.floor(min / 10) * 10;
  const roundedMax = Math.ceil(max / 10) * 10;
  
  // console.log('calculateYAxisDomain: min=', min, 'max=', max, 'roundedMin=', roundedMin, 'roundedMax=', roundedMax);
  
  // Ensure we have at least some range
  const range = roundedMax - roundedMin;
  if (range < 10) {
    // console.log('calculateYAxisDomain: Range too small, adding padding');
    return [roundedMin - 10, roundedMax + 10];
  }
  
  // console.log('calculateYAxisDomain: Final domain:', [roundedMin, roundedMax]);
  return [roundedMin, roundedMax];
}

const MultiListenersChart2: React.FC<MultiListenersChart2Props> = ({
  title,
  volume,
  endDate,
  image,
  market,
  eventSlug,
  customData,
  interval
}) => {
  const [chartDataYes, setChartDataYes] = useState<ChartDataPoint[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    asset1: {
      label: "Forecast",
      color: "#7DFDFE",
    },
  });
  const [hoveredChance, setHoveredChance] = useState<number | undefined>(undefined);

  // Create a custom tooltip component that can access the Chart component's state
  const CustomTooltipWithState: React.FC<CustomTooltipProps & { isCustomData?: boolean }> = ({ 
    active, 
    payload, 
    label, 
    isCustomData = false
  }) => {
    let formattedLabel = label;
    if (label && typeof label === 'number') {
      const date = new Date(label * 1000);
      formattedLabel = date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-transparent p-2 border border-transparent rounded shadow text-white">
          <p className="text-sm font-semibold">{formattedLabel}</p>
          {payload.map(
            (entry, index) =>
              entry.value !== null && (
                <p key={index} style={{ color: entry.color }} className="text-sm">
                  {entry.name} {isCustomData ? `${entry.value}M` : `${entry.value?.toFixed(1)}M`}
                </p>
              )
          )}
        </div>
      );
    }
    return null;
  };
  const [allChartData, setAllChartData] = useState<ChartDataPoint[]>([]);

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

  useEffect(() => {
    setChartData(chartDataYes);
  }, [chartDataYes]);

  useEffect(() => {
    const fetchAllPriceHistories = async () => {
      try {
        const payload = {
          start_ts: getIntervalDate("all"),
          end_ts: new Date().getTime(),
        };
        const { success, result } = await getForecastHistory(eventSlug, payload);
        if (success) {
          const formattedData = result.map((item: any) => ({
            t: Math.floor(new Date(item.createdAt).getTime() / 1000),
            p: item.forecast / 100,
          }));
          setAllChartData(formattedData);
          const processedData = processSingleChartData(formattedData, interval);
          setChartDataYes(processedData);
        } else {
          console.error("MonthlyListenersChart2: Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching all market data:", error);
      }
    };

    fetchAllPriceHistories();
  }, [eventSlug]);

  useEffect(() => {
    if (allChartData.length > 0) {
      const dataPoints = allChartData.map(({ t, p }) => ({ t, p }));
      const processedData = processSingleChartData(dataPoints, interval);
      setChartDataYes(processedData);
    }
  }, [interval, allChartData]);

  useEffect(() => {
    if (chartDataYes && chartDataYes.length > 0 && hoveredChance === undefined) {
      const lastDataPoint: any = chartDataYes[chartDataYes.length - 1];
      if (lastDataPoint && lastDataPoint.asset1 !== null) {
        // Don't auto-set hoveredChance here, let it stay undefined when not hovering
      }
    }
  }, [chartDataYes, hoveredChance]);

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const lastPoint: any = chartData[chartData.length - 1];
      if (lastPoint && lastPoint.asset1 !== null && lastPoint.asset1 !== undefined) {
        // Don't auto-set hoveredChance here, let it stay undefined when not hovering
      }
    }
  }, [chartData]);

  // Calculate the current displayed chance value
  const displayChance =
    hoveredChance !== undefined
      ? hoveredChance
      : chartData && chartData.length > 0
        ? chartData[chartData.length - 1]?.asset1
        : undefined;

  const chanceColor = '#7DFDFE';

  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    const isLastPoint = index === chartData.length - 1;
    
    if (!isLastPoint) return null;
    
    const dotColor = "#7DFDFE";
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="none"
          stroke={dotColor}
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
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={dotColor}
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

  if (!chartData || chartData.length === 0) {
    return (
      <Card
        className="w-[115vw] lg:w-[55vw] sm:w-[90vw] h-auto"
        style={{ backgroundColor: "transparent", borderColor: "transparent" }}
      >
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Navigation bar restored to original position for mobile */}
      <div className="block sm:hidden w-full z-20 sticky top-0 bg-black/90 border-b border-neutral-800 backdrop-blur-md">
        <div className="flex items-center px-4 py-3">
          <div
            style={{
              width: "40px",
              height: "40px",
              overflow: "hidden",
              borderRadius: "10px",
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/logo_icon.png"
              alt="Event"
              width={40}
              height={40}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div className="text-[18px] font-semibold pl-3 truncate">
            {title || ""}
          </div>
        </div>
      </div>

      <Card
        className="h-auto"
        style={{ backgroundColor: "transparent", borderColor: "transparent" }}
      >
        <div>
          <CardHeader className="p-0">
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
                    src="/images/logo_icon.png"
                    alt="Event"
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
                  className="text-[19px] lg:text-[26px] sm:text-[20px]"
                  style={{ paddingLeft: "15px" }}
                >
                  {title || ""}
                </div>
              </div>
            </CardTitle>
            <CardDescription className="py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex pb-1 flex-wrap gap-3 items-center">
                <p>Vol ${toTwoDecimal(volume)?.toLocaleString() || ""}</p>
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
            {displayChance !== undefined && (
              <div className="flex items-center justify-between mt-6 mb-6 w-full">
                <div className="flex items-center">
                  <span className="text-3xl lg:text-4xl font-semibold" style={{ color: chanceColor }}>
                    {displayChance !== undefined && displayChance !== null ? displayChance.toFixed(1) : '0.0'}M
                  </span>
                  <span className="text-lg font-light ml-2" style={{ color: chanceColor }}>forecast</span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="gap-0 sm:gap-2 p-0">
              <div className="w-full test">
                <CardHeader className="p-0 sm:pb-4">
                </CardHeader>
              <CardContent className="p-0">
                <ChartContainer
                  className="h-[350px] p-0 pr-0 lg:h-[300px] sm:h-[250px] w-full"
                  config={chartConfig}
                  onMouseLeave={() => {
                    setHoveredChance(undefined);
                  }}
                >
                  <LineChart
                    data={chartData}
                    syncId="chart"
                    syncMethod="value"
                    className="pl-0"
                    onMouseMove={(e) => {
                      if (e && e.activePayload && e.activePayload.length > 0) {
                        setHoveredChance(e.activePayload[0].value);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#262626" />
                    <XAxis
                      dataKey="rawTimestamp"
                      type="number"
                      scale="time"
                      domain={['dataMin', 'dataMax']}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={100}
                      ticks={chartData.length > 0 ? (() => {
                        const minTime = Math.min(...chartData.map(d => d.rawTimestamp || 0));
                        const maxTime = Math.max(...chartData.map(d => d.rawTimestamp || 0));
                        const tickCount = screenWidth < 640 ? 4 : 6;
                        const step = (maxTime - minTime) / (tickCount - 1);
                        return Array.from({ length: tickCount }, (_, i) => minTime + (step * i));
                      })() : undefined}
                      allowDuplicatedCategory={false}
                      tickFormatter={(t) => {
                        const date = new Date(t * 1000);
                        // For shorter intervals, show time; for longer intervals, show date
                        if (interval === '1h' || interval === '6h' || interval === '1d') {
                          return date.toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                          });
                        } else {
                          return date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric"
                          });
                        }
                      }}
                    />
                    <YAxis
                      domain={[0, 'dataMax']}                    
                      tickFormatter={(tick) => customData ? `${tick}M` : `${tick}M`}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      orientation="right"
                      width={40}
                    />
                    <Tooltip 
                      content={<CustomTooltipWithState isCustomData={!!customData} />}
                      allowEscapeViewBox={{ x: true, y: false }}
                      isAnimationActive={false}
                      shared={true}
                      cursor={false}
                    />
                    <Legend
                      height={36}
                      iconType="rect"
                      wrapperStyle={{ top: "-30px", paddingBottom: 32 }}
                      iconSize={8}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="asset1"
                      name={chartConfig.asset1.label}
                      stroke="#7DFDFE"
                      strokeWidth={1}
                      dot={<CustomDot />}
                      activeDot={{ r: 4, fill: "#7DFDFE", stroke: "#fff", strokeWidth: 2 }}
                      label={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              </div>
          </CardContent>
        </div>
      </Card>
    </>
  );
};

export default MultiListenersChart2;
