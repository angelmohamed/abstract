"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowRightLeft, Clock } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/app/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChartDataPoint, processSingleChartDataNew } from "@/utils/processChartData";
import { toTwoDecimal } from "@/utils/helpers";
import ChartIntervals from "@/app/components/customComponents/ChartIntervals";
import { getForecastHistory } from "@/services/market";

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
    case "all":
      return new Date(now.setFullYear(now.getFullYear() - 1)).getTime();
    default:
      return new Date(now.setFullYear(now.getFullYear() - 1)).getTime();
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
                {entry.name} {isCustomData ? `${entry.value}M listeners` : `${entry.value?.toFixed(1)}¢`}
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
  const [chartDataNo, setChartDataNo] = useState<ChartDataPoint[]>([]);
  const [selectedYes, setSelectedYes] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    asset1: {
      label: "Yes",
      color: "#7DFDFE",
    },
  });
  const [currentChance, setCurrentChance] = useState<number | undefined>(undefined);
  const [isHovering, setIsHovering] = useState<boolean>(false);

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
    if (selectedYes) {
      setChartData(chartDataYes);
      setChartConfig({
        asset1: { label: "Yes", color: "#7DFDFE" },
      });
    } else {
      // Invert the data for "No" view: 100 - original value
      const invertedData = chartDataYes.map((point: any) => ({
        ...point,
        asset1: point.asset1 !== null ? 100 - point.asset1 : null
      }));
      setChartData(invertedData);
      setChartConfig({ asset1: { label: "No", color: "#EC4899" } });
    }
  }, [selectedYes, chartDataYes, chartDataNo]);

  useEffect(() => {
    // If custom data is provided, use it instead of fetching from API
    if (customData && customData.length > 0) {
      setChartDataYes(customData);
      setChartDataNo(customData); // Use same data for both Yes/No in this case
      return;
    }

    const fetchAllPriceHistories = async () => {
      
        try {
          let startDate = getIntervalDate(interval);
          let end_ts = new Date().getTime();
          const payload = {
              start_ts:startDate,
              end_ts:end_ts
          }
          const { success, result } = await getForecastHistory(eventSlug, payload);
          if (success) {
            let formettedData = result.map((item:any)=>{
              let formetTime: any = Math.floor(new Date(item.createdAt).getTime() / 1000);
              // let formetTime = item.createdAt;
              return {
                t: formetTime,
                p: item.forecast
              }
            });
            const processedData = processSingleChartDataNew(formettedData, interval);
            if (processedData && processedData.length > 0) {
              setChartDataYes(processedData);
            } else {
              console.warn("No processed data for Yes market");
            }
          }
      } catch (error) {
        console.error("Error parsing market data:", error);
      }
    };
    fetchAllPriceHistories();
  }, [market, interval, customData]);

  // Set initial chance from chart data when it changes (for both API and custom data)
  useEffect(() => {
    if (chartDataYes && chartDataYes.length > 0 && currentChance === undefined) {
      const lastDataPoint: any = chartDataYes[chartDataYes.length - 1];
      if (lastDataPoint && lastDataPoint.asset1 !== null) {
        setCurrentChance(lastDataPoint.asset1 / 100);
      }
    }
  }, [chartDataYes, currentChance]);

  // Set current chance from the last data point when chartData changes
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const lastPoint: any = chartData[chartData.length - 1];
      if (lastPoint && lastPoint.asset1 !== null && lastPoint.asset1 !== undefined) {
        setCurrentChance(lastPoint.asset1 / 100); // Convert from percentage to decimal
      }
    }
  }, [chartData]);

  const handleMouseEnter = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const value = data.activePayload[0].value / 100; // Convert from percentage to decimal
      setCurrentChance(value);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Reset to the last data point value
    if (chartData && chartData.length > 0) {
      const lastPoint: any = chartData[chartData.length - 1];
      if (lastPoint && lastPoint.asset1 !== null && lastPoint.asset1 !== undefined) {
        setCurrentChance(lastPoint.asset1 / 100);
      }
    }
  };

  // Calculate the current displayed chance value and color - use actual chart data
  const displayChance = currentChance;
  const chanceColor = selectedYes ? '#7DFDFE' : '#EC4899';

  // Custom dot component that only shows on the last data point
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    const isLastPoint = index === chartData.length - 1;
    
    if (!isLastPoint) return null;
    
    const dotColor = selectedYes ? "#7DFDFE" : "#EC4899";
    
    return (
      <g>
        {/* Animated pulsing ring */}
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
        
        {/* Main dot */}
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

  // Don't render if no chart data
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
      className="h-auto" // Wider on mobile
      style={{ backgroundColor: "transparent", borderColor: "transparent" }}
    >
      <div>
        <CardHeader className="pt-0 pl-10 sm:pl-0 pb-0">
          {/* Title Row: Title and Event Image */}
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
                className="text-[22px] lg:text-[26px] sm:text-[20px]"
                style={{ paddingLeft: "15px", marginRight: "10px" }}
              >
                {title || ""}
              </div>
            </div>
          </CardTitle>
          {/* Volume and Date info (should be above chance/logo row) */}
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
          {/* Chance/Forecast Row: Value left, toggle button right */}
          {displayChance !== undefined && (
            <div className="flex items-center justify-between mt-6 mb-6 w-full">
              <div className="flex items-center">
                <span className="text-3xl lg:text-4xl font-semibold" style={{ color: chanceColor }}>
                  {(displayChance * 100).toFixed(1)}M
                </span>
                <span className="text-lg font-light ml-2" style={{ color: chanceColor }}>forecast</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => setSelectedYes(!selectedYes)}>
                <ArrowRightLeft size={16} />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="gap-0 sm:gap-2 p-0">
            <div className="w-full test">
              <CardHeader className="p-0 sm:pb-4">
                {/* Removed the chance value div here */}
              </CardHeader>
            <CardContent className="p-0 sm:pl-0 pl-10 pr-8 sm:pr-0 pr-0">
              <ChartContainer
                className="h-[350px] p-0 pr-5 lg:h-[300px] sm:h-[200px] w-full" // No left padding
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
                    // domain={(() => {
                    //   const domain = calculateYAxisDomain(chartData, 'asset1');
                    //   console.log('ForecastChart Y-axis domain:', domain, 'for data length:', chartData.length);
                    //   return domain;
                    // })()}
                    domain={[0, 1]}                    
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
                  {["asset1"].map((asset, _) => (
                    <Line
                      key={asset}
                      type="step"
                      dataKey={asset}
                      name={chartConfig[asset].label}
                      stroke={selectedYes ? "#7DFDFE" : "#EC4899"}
                      strokeWidth={1}
                      dot={<CustomDot />}
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

export default MultiListenersChart2;
