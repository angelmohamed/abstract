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
import { getPriceHistory, getSeriesByEvent } from "@/services/market";
import { capitalize } from "@/lib/stringCase";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { momentFormat } from "@/app/helper/date";
import { useRouter } from "next/navigation";

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

interface GraphProps {
    id: any;
    interval: string;
    market: any;
    selectedMarket: any;
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
                                {entry.name} 
                            </p>
                        )
                )}
            </div>
        );
    }
    return null;
};

const Graph: React.FC<GraphProps> = ({ id, interval, market, selectedMarket }) => {
    const [chartDataYes, setChartDataYes] = useState<ChartDataPoint[]>([]);
    const [chartDataNo, setChartDataNo] = useState<ChartDataPoint[]>([]);
    const [selectedYes, setSelectedYes] = useState<boolean>(true);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [chartConfig, setChartConfig] = useState<any>([]);
    
    const [hoveredChance, setHoveredChance] = useState<number | undefined>(
        undefined
    );

    // State to track screen width
    const [screenWidth, setScreenWidth] = useState<number>(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );
    const ChartColors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ]
    
    // Update screen width on resize
    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = () => setScreenWidth(window.innerWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = {
                    market: selectedYes ? "yes" : "no",
                    interval,
                    fidelity: 30
                }
                const { success, result } = await getPriceHistory(id, data);
                if (success) {
                    let assetKeysData = result
                    .filter((item: any) => item.groupItemTitle === selectedMarket.groupItemTitle)
                    .map((item: any,index: any) => 
                        {
                            return {
                                label: item.groupItemTitle,
                                color: ChartColors[index],
                                asset: `asset${index+1}`,
                            }
                        }
                    );
                    
                    if (market.length > 1){
                        market.forEach((item: any) => {
                            const asset = assetKeysData.find((asset: any) => asset.label === item.groupItemTitle)
                            if(asset){
                                asset.last = selectedYes ? item.last : 100 - item.last
                            }
                        })
                        setChartConfig(assetKeysData);
                    }
                    const filteredResult = result.filter((item: any) => item.groupItemTitle === selectedMarket.groupItemTitle);
                    let processedData = processSingleChartData(filteredResult, interval);

                    if(selectedYes){
                        setChartDataYes(processedData);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, [id, market, selectedMarket, selectedYes]);

    useEffect(() => {
        if (selectedYes) {
            setChartData(chartDataYes);
        } else {
            setChartData(chartDataNo);
        }
    }, [selectedYes, chartDataYes, chartDataNo]);


    const xAxisInterval =
        screenWidth < 640
            ? Math.floor(chartData.length / 6)
            : Math.floor(chartData.length / 12);

    const CustomDot = (props: any) => {
        const { cx, cy, payload, index, stroke } = props;
        const isLastPoint = index === chartData.length - 1;
        
        if (!isLastPoint) return null;
        
        return (
          <g>
            {/* Animated pulsing ring */}
            <circle
              cx={cx}
              cy={cy}
              r={8}
              fill={stroke}
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
              fill={stroke}
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

    const displayChance = hoveredChance !== undefined ? hoveredChance : 0;
    return (
        <Card
            className="h-auto" // Wider on mobile
            style={{ backgroundColor: "transparent", borderColor: "transparent" }}
        >
            <div>
                <CardHeader className="p-0">
                    {displayChance !== undefined && (
                        <div className="flex justify-start mb-4">
                            {" "}
                            {/* Changed from justify-center to justify-start */}
                            {market?.length <= 1 && (
                            <CardTitle
                                className="text-4xl"
                                style={{ color: "#7dfdfe" }}
                            >
                                <span>{(displayChance)?.toFixed(1)}%</span>
                                <span className="text-2xl font-light"> chance</span>
                            </CardTitle>
                            )}
                            
                        </div>
                    )}
                    <CardDescription className="py-2">
                    </CardDescription>
                </CardHeader>

                <CardContent className="gap-0 sm:gap-2 p-0">
                    <div className="w-full test">
                        <CardHeader className="sm:pb-4 p-0 mt-3">
                        </CardHeader>
                        <CardContent className="p-0">
                            <ChartContainer
                                className="h-[550px] lg:h-[350px] sm:h-[400px] w-full" // Shorter on mobile
                                config={chartConfig}
                            >
                                <LineChart
                                    data={chartData}
                                    onMouseMove={(e) => {
                                        if (e && e.activePayload && e.activePayload.length > 0) {
                                            console.log(e.activePayload, "e.activePayload")
                                            const value = e.activePayload[0].payload.asset1;
                                            setHoveredChance(value);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredChance(undefined)
                                    }}
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
                                    {chartConfig.map((asset: any, idx: any) => (
                                        <Line
                                            key={asset.asset}
                                            type="step" // step bump
                                            dataKey={asset.asset}
                                            name={asset.label}
                                            stroke={asset.color}
                                            strokeWidth={2}
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

export default Graph;
