"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Clock } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/app/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
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

const CustomTooltip: React.FC<CustomTooltipProps & { isCustomData?: boolean; data: ChartDataPoint[] }> = ({ 
  active, 
  payload, 
  label, 
  isCustomData = false, 
  data = []
}) => {
  let formattedLabel = label;
  if (label && data) {
    const found: any = data.find(d => String(d.rawTimestamp) === String(label));
    if (found && found.rawTimestamp) {
      const date = new Date(found.rawTimestamp * 1000);
      formattedLabel = date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
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
  const [currentChance, setCurrentChance] = useState<number | undefined>(undefined);
  const [isHovering, setIsHovering] = useState<boolean>(false);
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

  // Determine X-axis interval based on screen width and custom data
  const xAxisInterval = customData 
    ? 3 // Show every 4th label (monthly labels for weekly data)
    : screenWidth < 640 
      ? Math.floor(chartData.length / 6) 
      : Math.floor(chartData.length / 12);

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
    if (chartDataYes && chartDataYes.length > 0 && currentChance === undefined) {
      const lastDataPoint: any = chartDataYes[chartDataYes.length - 1];
      if (lastDataPoint && lastDataPoint.asset1 !== null) {
        setCurrentChance(lastDataPoint.asset1);
      }
    }
  }, [chartDataYes, currentChance]);

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const lastPoint: any = chartData[chartData.length - 1];
      if (lastPoint && lastPoint.asset1 !== null && lastPoint.asset1 !== undefined) {
        setCurrentChance(lastPoint.asset1);
      }
    }
  }, [chartData]);

  const handleMouseEnter = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const value = data.activePayload[0].value;
      setCurrentChance(value);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (chartData && chartData.length > 0) {
      const lastPoint: any = chartData[chartData.length - 1];
      if (lastPoint && lastPoint.asset1 !== null && lastPoint.asset1 !== undefined) {
        setCurrentChance(lastPoint.asset1);
      }
    }
  };

  const displayChance = currentChance;
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
                style={{ paddingLeft: "15px", marginRight: "10px" }}
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
                  {displayChance !== undefined ? displayChance.toFixed(1) : '0.0'}M
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
                className="h-[350px] p-0 pr-0 lg:h-[300px] sm:h-[200px] w-full"
                config={chartConfig}
              >
                <LineChart
                  data={chartData}
                  onMouseMove={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="pl-0"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1a1a1a" />
                  <XAxis
                    dataKey="rawTimestamp"
                    interval={xAxisInterval}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={100}
                    tickFormatter={(t) => {
                      const found = chartData.find(d => d.rawTimestamp === t);
                      return found ? found.timestamp : '';
                    }}
                  />
                  <YAxis
                    domain={[0, 'dataMax']}                    
                    tickFormatter={(tick) => customData ? `${tick}M` : `${tick}M`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    orientation="right"
                  />
                  <Tooltip content={<CustomTooltip isCustomData={!!customData} data={chartData} />} />
                  <Legend
                    height={36}
                    iconType="rect"
                    wrapperStyle={{ top: "-30px", paddingBottom: 32 }}
                    iconSize={8}
                  />
                  <Line
                    type="step"
                    dataKey="asset1"
                    name={chartConfig.asset1.label}
                    stroke="#7DFDFE"
                    strokeWidth={1}
                    dot={<CustomDot />}
                    label={false}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
            </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MultiListenersChart2;
