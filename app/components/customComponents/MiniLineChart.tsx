"use client";
import React, { useEffect, useState } from "react";
import Ye from "/public/images/Ye.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRightLeft, Clock } from "lucide-react";
import { ChartContainer, ChartConfig as UIChartConfig } from "@/app/components/ui/chart";
// import Polymarket from "/public/images/polymarket.png";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { processSingleChartData } from "@/utils/processChartData";
import { toTwoDecimal } from "@/utils/helpers";

interface Market {
  clobTokenIds: string;
}

interface ChartDataItem {
  timestamp: string;
  asset1: number | null;
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

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface MiniLineChartProps {
  title: number;
  volume?: string;
  endDate?: string;
  market: Market[];
  interval: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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

export default function MiniLineChart({
  title,
  volume,
  endDate,
  market,
  interval,
}: MiniLineChartProps) {
  const [chartDataYes, setChartDataYes] = useState<ChartDataItem[]>([]);
  const [chartDataNo, setChartDataNo] = useState<ChartDataItem[]>([]);
  const [selectedYes, setSelectedYes] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    asset1: {
      label: "Yes",
      color: "#27ae60",
    },
  });

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
      if (market?.length > 0) {
        const yes = market?.[0]?.clobTokenIds ? JSON.parse(market?.[0]?.clobTokenIds)[0] : "";
        const no = market?.[0]?.clobTokenIds ? JSON.parse(market?.[0]?.clobTokenIds)[1] : "";
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
          setChartDataYes(processSingleChartData(data.history, interval) as unknown as ChartDataItem[]);
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
          setChartDataNo(processSingleChartData(data.history, interval) as unknown as ChartDataItem[]);
        } catch (error) {
          console.error("Error fetching PriceHistory:", error);
        }
      }
    };
    fetchAllPriceHistories();
  }, [market, interval]);

  const chartContainerConfig: UIChartConfig = {
    asset1: {
      label: chartConfig.asset1.label,
      color: chartConfig.asset1.color,
    },
  };

  // Calculate the current displayed chance value and color
  const displayChance = selectedYes ? title : 1 - title;
  const chanceColor = selectedYes ? "#27ae60" : "#e64800";

  return (
    <Card
      className="h-auto"
      style={{ backgroundColor: "transparent", borderColor: "transparent" }}
    >
      <div>
        <CardHeader className="pt-0 pb-0">
          <CardTitle className="text-4xl" style={{ color: chanceColor }}>
            <span>{(displayChance).toFixed(1)}%</span>
            <span className="text-2xl font-light">  chance</span>
          </CardTitle>

          <CardDescription className="py-3 flex gap-3 justify-start items-center">
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
            <Button
              variant="ghost"
              onClick={() => setSelectedYes(!selectedYes)}
            >
              <ArrowRightLeft />
            </Button>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="w-[100%] test">
            <CardHeader></CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px] w-full" config={chartContainerConfig}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="timestamp"
                    interval={Math.floor(chartData.length / 12)}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={100}
                  />
                  <YAxis
                    domain={[0, 100]} // Set range between 0% and 100%
                    tickFormatter={(tick) => `${tick}%`} // Format the ticks as percentages
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
                  {["asset1"].map((asset) => (
                    <Line
                      key={asset}
                      type="natural"
                      dataKey={asset}
                      name={chartConfig[asset].label}
                      stroke={
                        selectedYes
                          ? "#27ae60"
                          : "#e64800"
                      }
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
}