"use client";

import React, { useContext, useEffect, useState } from "react";
import Ye from "/public/images/Ye.png";
// import Polymarket from "/public/images/polymarket.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Legend, Line, LineChart, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { ArrowRightLeft, Clock } from "lucide-react";
import { ChartContainer, ChartConfig } from "@/app/components/ui/chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/app/components/ui/card";
import { processSingleChartData, processMultiChartData } from "@/utils/processChartData";
import { toTwoDecimal } from "@/utils/helpers";
import { HoverCard } from "radix-ui";
import { CountdownTimerIcon } from "@radix-ui/react-icons";
import { getPriceHistory, getSeriesByEvent, getForecastHistory } from "@/services/market";
import { capitalize } from "@/lib/stringCase";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { momentFormat } from "@/app/helper/date";
import { useRouter } from "next/navigation";
import { isEmpty } from "@/lib/isEmpty";
import { SocketContext } from "@/config/socketConnectivity";

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

interface ChartProps {
    id: string;
    title?: string;
    volume?: number;
    endDate?: string;
    image: any;
    market: MarketData[];
    interval: string;
    chance?: number;
    series?: any
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

const Chart: React.FC<ChartProps> = ({
    id,
    title,
    volume,
    endDate,
    image,
    market,
    interval,
    chance,
    series
}) => {
    const socketContext = useContext(SocketContext);
    const [chartDataYes, setChartDataYes] = useState<any[]>([]);
    const [chartDataNo, setChartDataNo] = useState<any[]>([]);
    const [selectedYes, setSelectedYes] = useState<boolean>(true);
    const [chartData, setChartData] = useState<any[]>([]);
    const [chartConfig, setChartConfig] = useState<any>([]);
    const [assetKeys, setAssetKeys] = useState<any>([]);
    const [seriesData, setSeriesData] = useState<any>([])
    const [allChartData, setAllChartData] = useState<any>([]);
    const [allChartDataYes, setAllChartDataYes] = useState<any[]>([]);
    const [allChartDataNo, setAllChartDataNo] = useState<any[]>([]);
    const route = useRouter()

    const [hoveredChance, setHoveredChance] = useState<number | undefined>(
        undefined
    );
    const [multiHoveredChance, setMultiHoveredChance] = useState<any>([]);

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

    // Determine X-axis interval based on screen width
    const xAxisInterval =
        screenWidth < 640
            ? Math.floor(chartData.length / 6)
            : Math.floor(chartData.length / 12);

    useEffect(() => {
        if (selectedYes) {
            setChartData(chartDataYes);
            // setChartConfig({
            //     asset1: { label: "Yes", color: "#7dfdfe" },
            // });
        } else {
            setChartData(chartDataNo);
            // setChartConfig({ asset1: { label: "No", color: "#ec4899" } });
        }
    }, [selectedYes, chartDataYes, chartDataNo]);

    // Add getIntervalDate function for consistent interval handling
    const getIntervalDate = (interval: string) => {
        const now = new Date();
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        
        switch (interval) {
            case "1h":
                return new Date(now.getTime() - 60 * 60 * 1000).getTime();
            case "6h":
                return new Date(now.getTime() - 6 * 60 * 60 * 1000).getTime();
            case "1d":
                // Start from exactly 24 hours ago from now
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
    };

    // Update fetchData logic to fetch all data once like MonthlyListenersChart2
    const fetchData = async () => {
        try {
            // Fetch all data without timestamp filtering (like MonthlyListenersChart2)
            const data = {
                market: selectedYes ? "yes" : "no",
                interval: "all", // Always fetch all data
                fidelity: 30,
                // Remove timestamp parameters to get all available data
            };
            console.log('Chart fetchData - Request data:', data);
            
            const { success, result } = await getPriceHistory(id, data);
            console.log('Chart fetchData - API response:', { success, result });
            
            if (success) {
                let assetKeysData = result.map((item: any, index: any) => {
                    return {
                        label: item.groupItemTitle,
                        color: ChartColors[index],
                        asset: `asset${index + 1}`,
                    };
                });
                if (market.length > 1) {
                    // Sort markets by odds to get the top 4 with highest odds
                    const sortedMarkets = [...market].sort((a, b) => {
                        const aOdd = selectedYes ? a.odd : 100 - a.odd;
                        const bOdd = selectedYes ? b.odd : 100 - b.odd;
                        return bOdd - aOdd; // Sort descending (highest first)
                    });
                    
                    // Take only the top 4 markets with highest odds
                    const top4Markets = sortedMarkets.slice(0, 4);
                    
                    console.log('Market sorting debug:', {
                        selectedYes,
                        originalMarkets: market.map(m => ({ 
                            label: m.groupItemTitle, 
                            originalOdd: m.odd, 
                            calculatedOdd: selectedYes ? m.odd : 100 - m.odd 
                        })),
                        sortedMarkets: sortedMarkets.map(m => ({ 
                            label: m.groupItemTitle, 
                            originalOdd: m.odd, 
                            calculatedOdd: selectedYes ? m.odd : 100 - m.odd 
                        })),
                        top4Markets: top4Markets.map(m => ({ 
                            label: m.groupItemTitle, 
                            originalOdd: m.odd, 
                            calculatedOdd: selectedYes ? m.odd : 100 - m.odd 
                        })),
                        resultLabels: result.map(r => r.groupItemTitle)
                    });
                    
                    // Update assetKeysData to match the top 4 markets
                    const top4AssetKeys = top4Markets.map((marketItem: any, index: any) => {
                        return {
                            label: marketItem.groupItemTitle,
                            color: ChartColors[index], // Use sequential colors for top 4
                            asset: `asset${index + 1}`,
                            odd: selectedYes ? marketItem.odd : 100 - marketItem.odd,
                            fullLabel: `${marketItem.groupItemTitle} ${selectedYes ? 'Yes' : 'No'}` // Add full label with Yes/No
                        };
                    });
                    
                    setChartConfig(top4AssetKeys);
                    
                    // Filter and reorder result data to match the top 4 markets
                    const orderedResultData: (any | null)[] = [];
                    for (const marketItem of top4Markets) {
                        const matchingResult: any | undefined = result.find((resultItem: any) => 
                            resultItem.groupItemTitle === marketItem.groupItemTitle
                        );
                        if (matchingResult) {
                            orderedResultData.push(matchingResult);
                        } else {
                            console.warn(`No data found for market: ${marketItem.groupItemTitle}`);
                            // Push null to maintain array structure
                            orderedResultData.push(null);
                        }
                    }
                    
                    console.log('Data matching debug:', {
                        orderedResultDataCount: orderedResultData.length,
                        hasNulls: orderedResultData.some(item => item === null),
                        dataLengths: orderedResultData.map(item => item ? item.data?.length : 0)
                    });
                    
                    let t = orderedResultData.map((item) => item ? item.data : []);
                    let formattedData = t.map((innerArray) => {
                        if (!innerArray || innerArray.length === 0) return [];
                        return innerArray.map((item) => {
                            let formattedTime = Math.floor(new Date(item.t).getTime() / 1000);
                            // Divide by 100 to get proper percentage (0-1 range)
                            return { t: formattedTime, p: item.p / 100 }; 
                        });
                    });
                    
                    // Store all data for current selection
                    if (selectedYes) {
                        setAllChartDataYes(formattedData);
                    } else {
                        setAllChartDataNo(formattedData);
                    }
                    
                    // Process data with current interval
                    let processedData = processMultiChartData(
                        formattedData[0] || [],
                        formattedData[1] || [],
                        formattedData[2] || [],
                        formattedData[3] || [],
                        interval
                    );
                    if (selectedYes) {
                        setChartDataYes(processedData);
                    } else {
                        setChartDataNo(processedData);
                    }
                } else {
                    setChartConfig([
                        {
                            label: capitalize(
                                selectedYes
                                    ? market?.[0]?.outcome?.[0]?.title || "yes"
                                    : market?.[0]?.outcome?.[1]?.title || "no"
                            ),
                            color: selectedYes ? "#7dfdfe" : "#ec4899",
                            asset: "asset1",
                        },
                    ]);
                    const t = result[0]?.data;
                    let formattedData = t.map((item: any) => {
                        let formattedTime: any = Math.floor(new Date(item.t).getTime() / 1000);
                        return {
                            t: formattedTime,
                            p: item.p / 100, // Divide by 100 to get proper percentage
                        };
                    });
                    
                    // Store all data for current selection
                    if (selectedYes) {
                        setAllChartDataYes(formattedData);
                    } else {
                        setAllChartDataNo(formattedData);
                    }
                    
                    // Process data with current interval
                    let processedData = processSingleChartData(formattedData, interval);
                    if (selectedYes) {
                        setChartDataYes(processedData);
                    } else {
                        setChartDataNo(processedData);
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [market, selectedYes]); // Remove interval from dependencies

    // Add separate effect to handle interval changes using stored data (like MonthlyListenersChart2)
    useEffect(() => {
        if (selectedYes && allChartDataYes.length > 0) {
            if (market.length > 1 && Array.isArray(allChartDataYes[0])) {
                // Multi-chart data processing - allChartDataYes is an array of arrays
                let processedData = processMultiChartData(
                    allChartDataYes[0] || [],
                    allChartDataYes[1] || [],
                    allChartDataYes[2] || [],
                    allChartDataYes[3] || [],
                    interval
                );
                setChartDataYes(processedData);
            } else if (market.length <= 1) {
                // Single chart data processing - allChartDataYes is a single array
                let processedData = processSingleChartData(allChartDataYes, interval);
                setChartDataYes(processedData);
            }
        } else if (!selectedYes && allChartDataNo.length > 0) {
            if (market.length > 1 && Array.isArray(allChartDataNo[0])) {
                // Multi-chart data processing - allChartDataNo is an array of arrays
                let processedData = processMultiChartData(
                    allChartDataNo[0] || [],
                    allChartDataNo[1] || [],
                    allChartDataNo[2] || [],
                    allChartDataNo[3] || [],
                    interval
                );
                setChartDataNo(processedData);
            } else if (market.length <= 1) {
                // Single chart data processing - allChartDataNo is a single array
                let processedData = processSingleChartData(allChartDataNo, interval);
                setChartDataNo(processedData);
            }
        }
    }, [interval, allChartDataYes, allChartDataNo, selectedYes, market]);

    useEffect(() => {
        const socket = socketContext?.socket;
        if (!socket) return;
    
        const chartUpdate = () => {
            fetchData();
        };
        
        socket.on("chart-update", chartUpdate);
        return () => {
          socket.off("chart-update");
        };

    }, [market, selectedYes]); // Remove interval from dependencies here too

    const getSeriesData = async(id:any)=>{
        try{

            let { success,result } = await getSeriesByEvent(id)
            if(success){
                setSeriesData(result)
            }
        }catch(err){
            console.log('error',err)
        }
    }
    useEffect(()=>{
        if(series?.slug){
            getSeriesData(series?.slug)
        }else{
            setSeriesData([])
        }
    },[series,id])

    // Calculate the current displayed chance value and color
    const displayChance =
        hoveredChance !== undefined
            ? hoveredChance
            : selectedYes
                ? chance
                : chance == 0
                    ? 0
                    : chance !== undefined
                        ? 100 - chance
                        : undefined;

    const chanceColor = selectedYes ? "#7dfdfe" : "#ec4899";
    const [activeDate, setActiveDate] = useState("Jun 18");
    const [multiDisplayChance, setMultiDisplayChance] = useState<any>([]);
    useEffect(() => {
        if (market?.length > 1) {
            // Sort markets by odds to get the top 4 with highest odds (matching chart logic)
            const sortedMarkets = [...market].sort((a, b) => {
                const aOdd = selectedYes ? a.odd : 100 - a.odd;
                const bOdd = selectedYes ? b.odd : 100 - b.odd;
                return bOdd - aOdd; // Sort descending (highest first)
            });
            const top4Markets = sortedMarkets.slice(0, 4);
            
            if(multiHoveredChance.length > 0){
                setMultiDisplayChance(top4Markets.map((item: any,index: any) => {
                    return {
                        label: item.groupItemTitle,
                        color: ChartColors[index],
                        asset: `asset${index+1}`,
                        fullLabel: `${item.groupItemTitle} ${selectedYes ? 'Yes' : 'No'}`, // Add full label with Yes/No
                        last: multiHoveredChance[index] ?? (selectedYes ? item.odd : 100 - item.odd)
                    }
                }));
            } else {
                setMultiDisplayChance(top4Markets.map((item: any,index: any) => {
                    return {
                        label: item.groupItemTitle,
                        color: ChartColors[index],
                        asset: `asset${index+1}`,
                        fullLabel: `${item.groupItemTitle} ${selectedYes ? 'Yes' : 'No'}`, // Add full label with Yes/No
                        last: selectedYes ? item.odd : 100 - item.odd
                    }
                }));
            }
        }
    }, [market, multiHoveredChance, selectedYes]);

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
                            <p>Vol ${(volume && toTwoDecimal(volume/100)?.toLocaleString()) || "0.00"}</p>
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
                            {seriesData?.length > 0 && (
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <Button className="...">
                                            <CountdownTimerIcon />
                                        </Button>
                                    </Popover.Trigger>
                                    <Popover.Content className="history_card" sideOffset={5}>
                                        <ul className="history_card_list">
                                        {seriesData?.length > 0 && (
                                            seriesData
                                                .filter((series) => series.status !== "active")
                                                .map((event) => (
                                                    <li key={event?.slug} onClick={()=>route.push(`/event-page/${event.slug}`)}>
                                                        {/* <Link href={`/event-page/${event.slug}`}> */}
                                                            {momentFormat(event.endDate,"D MMM YYYY, h:mm A")}
                                                        {/* </Link> */}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                        <Popover.Arrow className="HoverCardArrow" />
                                    </Popover.Content>
                                </Popover.Root>
                            )}
                            {seriesData?.length > 0 && (
                                seriesData
                                    .filter((series) => series.status === "active")
                                    .map((event) => (
                                    <div
                                        key={event.slug} 
                                        // href={`/event-page/${event.slug}`}
                                        onClick={()=>route.push(`/event-page/${event.slug}`)}
                                        className="w-[90px] rounded-full bg-transparent border border-[#262626] text-white hover:bg-[#262626] hover:text-white active:bg-[#262626] active:text-white text-center px-2 py-1 block text-sm"
                                    >
                                        {momentFormat(event?.endDate,"D MMM")}
                                    </div>
                                ))
                            )}

                            {/* <Button
                                // className="w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] active:bg-[#262626] active:text-[#fff]"
                                className={`w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] ${activeDate === "Jun 18"
                                        ? "bg-[#fff] text-[#262626] border-[#262626]"
                                        : ""
                                    }`}
                                onClick={() => setActiveDate("Jun 18")}
                            >
                                Jun 18
                            </Button>
                            <Button className="w-[90px] rounded-full bg-[transparent] border border-[#262626] text-[#fff] hover:bg-[#262626] hover:text-[#fff] active:bg-[#262626] active:text-[#fff]">
                                Jul 30
                            </Button> */}
                        </div>
                    </CardDescription>
                </CardHeader>

                <CardContent className="gap-0 sm:gap-2 p-0">
                    <div className="w-full test">
                        <CardHeader className="sm:pb-4 p-0 mt-3">
                            {displayChance !== undefined && isEmpty(displayChance) && (
                                <div className="flex justify-start mb-4">
                                    {" "}
                                    {/* Changed from justify-center to justify-start */}
                                    {market?.length <= 1 && (
                                    <CardTitle
                                        className="text-4xl"
                                        style={{ color: chanceColor }}
                                    >
                                        <span>{typeof displayChance === 'number' ? displayChance.toFixed(1) : ''}%</span>
                                        <span className="text-2xl font-light"> chance</span>
                                    </CardTitle>
                                    )}
                                    
                                </div>
                            )}
                            {/* {multiDisplayChance.length > 0 && (
                                <div className="flex justify-start mb-4">
                                    {market?.length > 1 && multiDisplayChance.map((item: any, i: number) => (
                                        <CardTitle
                                            key={i}
                                            className="text-4xl"
                                            style={{ color: item.color }}
                                        >
                                            <span>{(item.last)?.toFixed(1)}%</span>
                                            <span className="text-2xl font-light"> chance</span>
                                        </CardTitle>
                                    ))}
                                </div>
                            )} */}
                        </CardHeader>
                        <CardContent className="p-0">
                            <ChartContainer
                                className="h-[350px] p-0 lg:h-[300px] sm:h-[200px] w-full"
                                config={chartConfig}
                            >
                                <LineChart
                                    data={chartData}
                                    onMouseMove={(e) => {
                                        if (e && e.activePayload && e.activePayload.length > 0) {
                                            if(market?.length > 1){
                                                const multiHoveredValue = e.activePayload.map((item: any) => item.value);
                                                setMultiHoveredChance(multiHoveredValue);
                                            } else {
                                                const hoveredValue = e.activePayload[0].payload.asset1 || 0 ;
                                                if(!isEmpty(hoveredValue)){
                                                    setHoveredChance(hoveredValue); // Convert to percentage
                                                }else{
                                                    if(hoveredValue == 0) {
                                                        setHoveredChance(0)
                                                    } else {
                                                        setHoveredChance(undefined);
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredChance(undefined)
                                        setMultiHoveredChance([])
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
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
                                            name={`${asset.fullLabel || `${asset.label} ${selectedYes ? 'Yes' : 'No'}`} ${
                                                multiDisplayChance.length > 0 && multiDisplayChance.find((item: any) => item.label === asset.label)
                                                ? multiDisplayChance.find((item: any) => item.label === asset.label)?.last.toFixed(1) + "%"
                                                : (displayChance !== undefined ? displayChance?.toFixed(1) + "%" : "")
                                            }`}
                                            stroke={asset.color}
                                            strokeWidth={2}
                                            dot={<CustomDot color={asset.color}/>}
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

export default Chart;
