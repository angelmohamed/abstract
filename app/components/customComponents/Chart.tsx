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
    const [chartDataYes, setChartDataYes] = useState<ChartDataPoint[]>([]);
    const [chartDataNo, setChartDataNo] = useState<ChartDataPoint[]>([]);
    const [selectedYes, setSelectedYes] = useState<boolean>(true);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [chartConfig, setChartConfig] = useState<any>([]);
    const [assetKeys, setAssetKeys] = useState<any>([]);
    const [seriesData, setSeriesData] = useState<any>([])
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
                    // result["no"] = result["yes"].map((item: any) => ({
                    //     ...item,
                    //     p: 100 - item.p
                    // }));
                    // result["bids"] = result["no"].map((item: any) => ({
                    //     ...item,
                    //     p: 5 + item.p
                    // }));
                    let assetKeysData = result.map((item: any,index: any) => 
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
                    }else{
                        setChartConfig([{
                            label: capitalize(selectedYes ? (market?.[0]?.outcome?.[0]?.title || "yes") : (market?.[0]?.outcome?.[1]?.title || "no")),
                            color: selectedYes ? "#7dfdfe" : "#ec4899",
                            asset: "asset1"
                        }]);
                    }
                    let processedData = processSingleChartData(result, interval);
                    if(selectedYes){
                        setChartDataYes(processedData);
                    } else {
                        setChartDataNo(processedData);
                    }
                }
            } catch (error) {
                console.log(error);
            }
          
            //   if (market && market.length > 0) {
            //     const yes = market?.[0]?.clobTokenIds ? JSON.parse(market?.[0]?.clobTokenIds || "")[0] : "";
            //     const no = market?.[0]?.clobTokenIds ? JSON.parse(market?.[0]?.clobTokenIds || "")[1] : "";
            //     try {
            //       const data = {
            //         market: yes,
            //         interval,
            //         fidelity: 30
            //       }
            //       const { success, result } = await getPriceHistory(id, data);
            //       setChartDataYes(processSingleChartData(data.history, interval));
            //     } catch (error) {
            //       console.error("Error fetching PriceHistory:", error);
            //     }
            //     try {
            //       // const response = await fetch(
            //       //   `/api/event-data/price-history?interval=${interval}&market=${no}&fidelity=${30}`,
            //       //   {
            //       //     method: "GET",
            //       //     headers: {
            //       //       "Content-Type": "application/x-www-form-urlencoded",
            //       //     },
            //       //   }
            //       // );
            //       // const data = await response.json();
            //       const data = {
            //         history:[]
            //       }
            //       setChartDataNo(processSingleChartData(data.history, interval));
            //     } catch (error) {
            //       console.error("Error fetching PriceHistory:", error);
            //     }
            //   }
        };
        fetchData();
    }, [market, interval, selectedYes]);

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
            if(multiHoveredChance.length > 0){
                setMultiDisplayChance(market.map((item: any,index: any) => {
                    return {
                        label: item.groupItemTitle,
                        color: ChartColors[index],
                        asset: `asset${index+1}`,
                        last: multiHoveredChance[index] ?? item.last
                    }
                }));
            } else {
                setMultiDisplayChance(market.map((item: any,index: any) => {
                    return {
                        label: item.groupItemTitle,
                        color: ChartColors[index],
                        asset: `asset${index+1}`,
                        last: selectedYes ? item.last : 100 - item.last
                    }
                }));
            }
        }
    }, [market, multiHoveredChance, selectedYes]);

    const CustomDot = (props: any) => {
        const { cx, cy, payload, index, color } = props;
        const isLastPoint = index === chartData.length - 1;
        
        if (!isLastPoint) return null;
        
        return (
          <g>
            {/* Animated pulsing ring */}
            <circle
              cx={cx}
              cy={cy}
              r={8}
              fill="none"
              stroke={color}
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
              fill={color}
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
                            {displayChance !== undefined && (
                                <div className="flex justify-start mb-4">
                                    {" "}
                                    {/* Changed from justify-center to justify-start */}
                                    {market?.length <= 1 && (
                                    <CardTitle
                                        className="text-4xl"
                                        style={{ color: chanceColor }}
                                    >
                                        <span>{(displayChance)?.toFixed(1)}%</span>
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
                                className="h-[550px] lg:h-[350px] sm:h-[400px] w-full" // Shorter on mobile
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
                                                const hoveredValue = e.activePayload[0].payload.asset1 ;
                                                if(hoveredValue || hoveredValue == 0){
                                                    setHoveredChance(hoveredValue); // Convert to percentage
                                                }else{
                                                    setHoveredChance(undefined);
                                                }
                                            }
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredChance(undefined)
                                        setMultiHoveredChance([])
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
                                            type="bump" // step bump
                                            dataKey={asset.asset}
                                            name={`${asset.label} ${
                                                multiDisplayChance.length > 0 && multiDisplayChance.find((item: any) => item.label === asset.label)
                                                ? multiDisplayChance.find((item: any) => item.label === asset.label)?.last + "%"
                                                : (displayChance !== undefined ? displayChance.toFixed(1) + "%" : "")
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
