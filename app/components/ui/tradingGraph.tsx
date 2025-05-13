import React from "react";
import Ye from "/public/images/Ye.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Comment } from "@/app/components/ui/comment";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface ChartDataPoint {
  month: string;
  desktop: number;
}

const chartData: ChartDataPoint[] = [
  { month: "January", desktop: 69 },
  { month: "February", desktop: 80 },
  { month: "March", desktop: 49 },
  { month: "April", desktop: 35 },
  { month: "May", desktop: 38 },
  { month: "June", desktop: 25 },
];

const chartConfig: ChartConfig = {
  desktop: {
    label: "Chance",
    color: "hsl(var(--chart-1))",
  },
};

interface TradingGraphProps {
  title?: string;
  volume?: string;
  image?: string;
}

export function TradingGraph({
  title,
  volume,
  image
}: TradingGraphProps) {
  return (
    <Card className="w-[100%] h-auto" style={{ backgroundColor: "transparent", borderColor: "transparent" }}> 
      <div>
          <CardHeader className="pt-0 pb-0">
            <CardTitle style={{ lineHeight: "1.5" }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: '10px' }}>
                  <Image src={image||Ye} alt="Ye" width={70} height={70} />
                </div>
                <div className="text-[26px]" style={{ marginRight: '10px' }}>
                  {title ||" Will Ye release an album before March 2025?"} 
                </div>
              </div>
            </CardTitle>
            <CardDescription className="pt-3">Vol ${volume||"2,173,943"}</CardDescription>
          </CardHeader>

          <CardContent>
          <div className="w-[100%]">
          <CardHeader>
            <CardTitle className="text-4xl text-[#7DFDFE]" >25% chance</CardTitle>
            <CardDescription className="text-[#7DFDFE]"> • Yes
              </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px] w-full" config={chartConfig}>
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 0,
                  right: 0,
                }}
              >
                <CartesianGrid vertical={false} stroke="#494949" strokeDasharray="2 4" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                {/* Added YAxis for percentage chances */}
                <YAxis
                  domain={[0, 100]} // Set range between 0% and 100%
                  tickFormatter={(tick) => `${tick}%`} // Format the ticks as percentages
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  orientation="right" // Moves the Y-axis to the right

                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="desktop"
                  type="natural"
                  stroke="#7DFDFE"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
          </CardFooter>
        </div>
      </CardContent>
      
      </div>
    </Card>
  );
}
