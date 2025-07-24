"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowRightLeft } from "lucide-react";
import { ChartContainer, ChartConfig as UIChartConfig } from "@/app/components/ui/chart";
import ChartIntervals from "./ChartIntervals";
import { Card, CardContent, CardTitle, CardDescription } from "@/app/components/ui/card";
import Logo from "../../../public/images/logo.png";
import Image from "next/image";
import SONOTRADE from "/images/SONOTRADE.png";
import { processSingleChartDataNew } from "@/utils/processChartData";
import { getPriceHistory } from "@/services/market";

interface Market {
  clobTokenIds: string;
}

interface ChartDataItem {
  timestamp: string;
  asset1: number | null;
  rawTimestamp?: number;
}

interface OrderbookChartProps {
  title: number;
  market: any;
  id: any;
  interval: string;
  setInterval: (interval: string) => void;
  customData?: ChartDataItem[];
  selectedMarket: any;
}

const CustomTooltip = ({ active, payload, label, data }: any) => {
  let formattedLabel = label;
  if (label && data) {
    const found = data.find((d: any) => String(d.rawTimestamp) === String(label));
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
          (entry: any, index: number) =>
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

const OrderbookChart: React.FC<OrderbookChartProps> = ({
  title,
  id,
  market,
  interval,
  setInterval,
  selectedMarket,
}) => {
  const [chartDataYes, setChartDataYes] = useState<ChartDataItem[]>([]);
  const [chartDataNo, setChartDataNo] = useState<ChartDataItem[]>([]);
  const [selectedYes, setSelectedYes] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [chartConfig, setChartConfig] = useState<UIChartConfig>({
    asset1: {
      label: "Yes",
      color: "#7DFDFE",
    },
  });

  // State to track screen width
  const [screenWidth, setScreenWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  // Determine X-axis interval based on screen width
  const xAxisInterval = screenWidth < 640 
    ? Math.floor(chartData.length / 6) 
    : Math.floor(chartData.length / 12);

  // Fixed sample data for consistent chart
  const SAMPLE_DATA: { t: number; p: number }[] = (() => {
    const arr: { t: number; p: number }[] = [];
    const now = Math.floor(Date.now() / 1000);
    const step = 60 * 60; // 1 hour step
    for (let i = 0; i < 20; i++) {
      const t = now - (19 - i) * step;
      const p = 0.2 + 0.6 * Math.sin(i / 3); // some smooth variation
      arr.push({ t, p });
    }
    return arr;
  })();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = {
          market: selectedYes ? "yes" : "no",
          interval,
          fidelity: 30,
        };
        const { success, result } = await getPriceHistory(id, data);
        if (success) {
          const filteredResult = result.find(
            (item: any) => item.groupItemTitle === selectedMarket.groupItemTitle
          );
          // Always use fixed sample data, but process it with processSingleChartData and the selected interval
          setChartDataYes(processSingleChartDataNew(filteredResult?.data || [], interval));
          setChartDataNo(processSingleChartDataNew(filteredResult?.data?.map(d => ({ t: d.t, p: 100 - d.p })) || [], interval));
        }
      } catch (error) {
        console.log(error)
      }
    }

    fetchData();
  }, [id, market, selectedMarket, interval]);

  useEffect(() => {
    if (selectedYes) {
      setChartData(chartDataYes);
      setChartConfig({ asset1: { label: "Yes", color: "#7DFDFE" } });
    } else {
      setChartData(chartDataNo);
      setChartConfig({ asset1: { label: "No", color: "#EC4899" } });
    }
  }, [selectedYes, chartDataYes, chartDataNo]);

  // Calculate the current displayed chance value and color
  const displayChance = selectedYes ? title : 1 - title;
  const chanceColor = selectedYes ? "#7DFDFE" : "#EC4899";

  // Custom dot component that only shows on the last data point
  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
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
          <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
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
          <animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  };

  return (
    <Card className="h-auto" style={{ backgroundColor: "transparent", borderColor: "transparent" }}>
      <div className="relative">
        {/* Volume and Date info (should be above chance/logo row) */}
        {/* (Volume removed as requested) */}
        {/* Chance Row: Chance value left, logo right */}
        <div className="flex items-center justify-between mb-3 pb-2 mt-4 w-full relative">
          <div className="flex items-center">
            <CardTitle className="text-4xl text-left ml-0" style={{ color: chanceColor }}>
              <span>{(displayChance * 100).toFixed(1)}%</span>
              <span className="text-2xl font-light"> chance</span>
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 mr-0" onClick={() => setSelectedYes(!selectedYes)}>
            <ArrowRightLeft size={16} />
          </Button>
        </div>
          <CardContent className="pt-0 pb-0 pl-0 pr-0">
            <div className="w-full p-0 m-0 pb-0" style={{ width: '102%', paddingBottom: 0 }}>
              <ChartContainer className="h-[300px] w-full p-0 m-0 flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none pb-0 mb-0" style={{ marginBottom: 0, paddingBottom: 0 }} config={chartConfig}>
                <LineChart data={chartData} className="pl-0" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                    domain={[0, 100]}
                    tickFormatter={(tick) => `${tick}%`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    orientation="right"
                  />
                  <Tooltip content={<CustomTooltip data={chartData} />} />
                  <Legend height={36} iconType="rect" wrapperStyle={{ top: "-30px", paddingBottom: 32 }} iconSize={8} />
                  <Line
                    type="step"
                    dataKey="asset1"
                    name={chartConfig.asset1.label}
                    stroke={selectedYes ? "#7DFDFE" : "#EC4899"}
                    strokeWidth={1}
                    dot={<CustomDot />}
                    label={false}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
              <div className="flex justify-center items-center m-0" style={{ minHeight: 0, paddingTop: 0, marginTop: 0, marginBottom: 0 }}>
                <ChartIntervals interval={interval} setInterval={setInterval} />
              </div>
            </div>
          </CardContent>
        </div>
    </Card>
  );
};

export default OrderbookChart;