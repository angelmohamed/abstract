"use client";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { processMultiChartData, ChartDataItem } from "@/utils/processChartData";
import { useEffect, useState } from "react";
import { ArrowRightLeft, Clock } from "lucide-react";
import { toTwoDecimal } from "@/utils/helpers";
import Image from "next/image";
// import Polymarket from "/public/images/polymarket.png";
import { StaticImageData } from "next/image";

// 定义接口
interface Market {
  groupItemTitle: string;
  clobTokenIds: string;
  bestAsk: number;
  // 根据实际需要可以添加更多字段
}

interface ChartConfigItem {
  label: string;
  color: string;
}

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    theme?: {
      light?: string;
      dark?: string;
    };
    icon?: React.ComponentType;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number | null;
    name: string;
    color: string;
  }>;
  label?: string;
}

interface MultiLineChartProps {
  title: string;
  volume: number;
  image: string | StaticImageData;
  endDate?: string;
  markets: Market[];
  interval: string;
  activeView?: 'Yes' | 'No';
}

export default function MultiLineChart({
  title,
  volume,
  image,
  endDate,
  markets,
  interval,
  activeView = 'Yes'
}: MultiLineChartProps) {
  const [multiChartData, setMultiChartData] = useState<ChartDataItem[]>([]);
  const [multiChartLabels, setMultiChartLabels] = useState<string[]>([]);
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (markets.length > 0) {
      const ids: string[] = [];
      const chartLabelsTemp: string[] = [];
      const chartDataTemp: any[] = [];

      const fetchAllPriceHistories = async () => {
        markets
          .sort((a, b) => b.bestAsk - a.bestAsk)
          .forEach((market) => {
            if (market.clobTokenIds) {
              const tokenIds = JSON.parse(market.clobTokenIds);
              const selectedTokenId = activeView === 'Yes' ? tokenIds[0] : tokenIds[1];
              ids.push(selectedTokenId);
              chartLabelsTemp.push(market.groupItemTitle);
            }
          });

        const idsLength = Math.min(ids.length, 4);
        
        try {
          const fetchPromises = ids.slice(0, idsLength).map(async (id) => {
            const response = await fetch(
              `/api/event-data/price-history?interval=${interval}&market=${id}&fidelity=30`
            );
            const data = await response.json();
            return data.history;
          });

          const responses = await Promise.all(fetchPromises);
          const processedData = processMultiChartData(
            responses[0] || [],
            responses[1] || [],
            responses[2] || [],
            responses[3] || [],
            interval
          );

          setMultiChartData(processedData);
          setMultiChartLabels(chartLabelsTemp);
        } catch (error) {
          console.error("Error fetching PriceHistory:", error);
        }
      };

      fetchAllPriceHistories();
    }
  }, [markets, interval, activeView]);

  const chartConfig: ChartConfig = {
    asset1: {
      label: multiChartLabels[0] || "Chance1",
      color: "hsl(var(--chart-1))",
    },
    asset2: {
      label: multiChartLabels[1] || "Chance2",
      color: "hsl(var(--chart-2))",
    },
    asset3: {
      label: multiChartLabels[2] || "Chance3",
      color: "hsl(var(--chart-3))",
    },
    asset4: {
      label: multiChartLabels[3] || "Chance4",
      color: "hsl(var(--chart-4))",
    },
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-transparent p-2 border border-transparent rounded shadow text-white">
          <p className="text-sm font-semibold">{label}</p>
          {payload.map(
            (entry, index) =>
              entry.value !== null && (
                <p key={index} style={{ color: entry.color }} className="text-sm">
                  {entry.name} {entry.value?.toFixed()}¢
                </p>
              )
          )}
        </div>
      );
    }
    return null;
  };

  const xAxisInterval = screenWidth < 640 ? Math.floor(multiChartData.length / 6) : Math.floor(multiChartData.length / 12);

  return (
    <Card
      className="w-[115vw] lg:w-[55vw] sm:w-[90vw] h-auto"
      style={{
        backgroundColor: "transparent",
        borderColor: "transparent",
      }}
    >
      <div>
      <CardHeader className="pt-0 pl-10 sm:pl-0 pb-0">
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
            <div className="text-[22px] lg:text-[26px] sm:text-[20px]" style={{ paddingLeft:"15px", marginRight: "10px" }}>
              {title}
            </div>
          </div>
        </CardTitle>
        <CardDescription className="py-2 pb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {/* First Line: Volume and Date */}
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

      </CardHeader>
      </div>
      <CardContent className="pl-4 sm:pl-0 pt-1 pb-0 pr-0">
        <div className="pr-0 pl-4 sm:pl-0 w-[100%]">
          <ChartContainer className="h-[350px] pl-5 sm:pl-0 p-0 pr-5 lg:h-[300px] sm:h-[200px] w-full" config={chartConfig}>
            <LineChart className="pl-4 sm:pl-0" data={multiChartData}>
              <XAxis
                dataKey="timestamp"
                interval={xAxisInterval}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
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
              {["1", "2", "3", "4"].map((assetNum, index) => (
                <Line
                  key={`asset${assetNum}`}
                  type="natural"
                  dataKey={`asset${assetNum}`}
                  name={chartConfig[`asset${assetNum}` as keyof ChartConfig].label}
                  stroke={`hsl(var(--chart-${index + 1}))`}
                  strokeWidth={2}
                  dot={false}
                  label={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}