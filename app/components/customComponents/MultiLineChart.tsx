"use client";
import { Line, LineChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
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
import { HoverCard } from "radix-ui";
import { CountdownTimerIcon } from "@radix-ui/react-icons";
import { Button } from "@/app/components/ui/button";

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
  activeView?: "Yes" | "No";
}

export default function MultiLineChart({
  title,
  volume,
  image,
  endDate,
  markets,
  interval,
  activeView = "Yes",
}: MultiLineChartProps) {
  const [multiChartData, setMultiChartData] = useState<ChartDataItem[]>([]);
  const [multiChartLabels, setMultiChartLabels] = useState<string[]>([]);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

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
              const selectedTokenId =
                activeView === "Yes" ? tokenIds[0] : tokenIds[1];
              ids.push(selectedTokenId);
              chartLabelsTemp.push(market.groupItemTitle);
            }
          });

        const idsLength = Math.min(ids.length, 4);

        try {
          const fetchPromises = ids.slice(0, idsLength).map(async (id) => {
            // const response = await fetch(
            //   `/api/event-data/price-history?interval=${interval}&market=${id}&fidelity=30`
            // );
            // const data = await response.json();
            const data = {
              history:[]
            }
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
                <p
                  key={index}
                  style={{ color: entry.color }}
                  className="text-sm"
                >
                  {entry.name} {entry.value?.toFixed()}¢
                </p>
              )
          )}
        </div>
      );
    }
    return null;
  };

  const xAxisInterval =
    screenWidth < 640
      ? Math.floor(multiChartData.length / 6)
      : Math.floor(multiChartData.length / 12);

  const [activeDate, setActiveDate] = useState("Jun 18");

  return (
    <Card
      className="h-auto"
      style={{
        backgroundColor: "transparent",
        borderColor: "transparent",
      }}
    >
      <div>
        <CardHeader className="p-0">
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
                  src={image as string}
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
                {title}
              </div>
            </div>
          </CardTitle>
          <CardDescription className="py-2 pb-6">
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
                      <li>Ended: Jan 16, 2025</li>
                      <li>Ended: Dec 18, 2024</li>
                      <li>Ended: Sep 2, 2024</li>
                      <li>Ended: Jun 6, 2024</li>
                      <li>Ended: May 7, 2024</li>
                      <li>Ended: March 19, 2024</li>
                      <li>Ended: Jan 16, 2024</li>
                      <li>Ended: Dec 18, 2023</li>
                      <li>Ended: Sep 2, 2023</li>
                      <li>Ended: Jun 6, 2023</li>
                      <li>Ended: May 7, 2023</li>
                      <li>Ended: March 19, 2023</li>
                      <li>Ended: Jan 16, 2023</li>
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
              <Button className="w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] active:bg-[#262626] active:text-[#fff]">
                Sep 17
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
      </div>
      <CardContent className="p-0">
        <div className="p-0">
          <ChartContainer
            className="h-[350px] lg:h-[300px] sm:h-[200px] w-full"
            config={chartConfig}
          >
            <LineChart className="" data={multiChartData}>
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
                  type="step"
                  dataKey={`asset${assetNum}`}
                  name={
                    chartConfig[`asset${assetNum}` as keyof ChartConfig].label
                  }
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
