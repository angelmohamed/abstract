import React from "react";
import Ye from "/public/images/Ye.png";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Comment } from "@/app/components/ui/comment";
import Concert from "/public/images/concert1.png";
import EventCard from "./eventCard";
import { useRouter } from "next/navigation";
// import Polymarket from "/public/images/polymarket.png";


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

const chartData = [
  { month: "January", desktop: 69 },
  { month: "February", desktop: 80 },
  { month: "March", desktop: 21 },
  { month: "April", desktop: 42 },
  { month: "May", desktop: 76 },
  { month: "June", desktop: 80 },
];


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
};

interface ImageCardProps {
  eventID: string | number;
  backgroundImage: string;
  eventImageSrc: string;
  question: string;
  probability?: number;
  totalPool?: string;
  yesPotential?: number | string;
  noPotential?: number | string;
  onYesClick?: () => void;
  onNoClick?: () => void;
}

export function ImageCard({
  eventID,
  backgroundImage,
  eventImageSrc,
  question,
  probability,
  totalPool,
  yesPotential,
  noPotential,
  onYesClick,
  onNoClick,
}: ImageCardProps) {
  const router = useRouter();

  // Navigate to event page
  const handleCardClick = () => {
    router.push(`/event-page/${eventID}`);
  };

  return (
    <Card
      className="max-w-7xl mx-auto h-auto relative" // Ensures the card is sized correctly
      style={{
        backgroundColor: "#161616",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover", // Ensures image covers the card
        backgroundPosition: "center", // Centers the image in the background
        height: "510px", // Set a height for the card to properly display the background
      }}
    >
      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25 z-0"
        style={{
          pointerEvents: "none", // Prevents the overlay from blocking clicks
        }}
      ></div>

      {/* Centered EventCard */}
      <div style={{ cursor: "pointer" }}
          onClick={handleCardClick} className="absolute top-1/2 left-1/2 transform max-w-[350px] -translate-x-1/2 -translate-y-1/2 z-10">
        <EventCard
          imageSrc={eventImageSrc}
          question={question}
          probability={probability}
          totalPool={totalPool}
          yesPotential={yesPotential}
          noPotential={noPotential}
          onYesClick={onYesClick}
          onNoClick={onNoClick}
        />
      </div>
    </Card>
  );
}
