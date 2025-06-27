"use client";
import React from "react";
import Image from "next/image";
import { MultipleOptionCard } from "@/app/components/ui/multipleOptionCard";
import { Card } from "@/app/components/ui/card";
import { useRouter } from "next/navigation";
// import Polymarket from "/public/images/polymarket.png";

interface Option {
  title?: string;
  question?: string;
  outcomes?: string;
  outcomePrices?: string;
  [key: string]: any;
}

interface ImageCardMultipleProps {
  eventID: string | number;
  backgroundImage: string;
  imageSrc: string;
  question: string;
  options: Option[];
  totalPool?: string;
  onYesClick?: () => void;
  onNoClick?: () => void;
  yesColor?: string;
  noColor?: string;
  yesHoverBg?: string;
  noHoverBg?: string;
  forecast?: boolean;
}

export function ImageCardMultiple({
  eventID,
  backgroundImage,
  imageSrc,
  question,
  options,
  totalPool,
  onYesClick,
  onNoClick,
  yesColor = "#27ae60",
  noColor = "pink",
  yesHoverBg = "#244445",
  noHoverBg = "#430a36",
  forecast = false
}: ImageCardMultipleProps) {
  // Transform options to match MultipleOptionCard's expected format
  const transformedOptions = options?.map(option => ({
    ...option,
    groupItemTitle: option.title || option.question,
    outcomes: option.outcomes || JSON.stringify(["Yes", "No"]),
    outcomePrices: option.outcomePrices || JSON.stringify([50, 50]),
    button1label: "Yes",
    button2label: "No"
  })) || [];

  const router = useRouter();

  // Navigate to event page
  const handleCardClick = () => {
    router.push(`/event-page/${eventID}`);
  };

  return (
    <Card
      className="max-w-7xl mx-auto h-auto relative"
      style={{
        backgroundColor: "#161616",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "510px",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-25 z-0" />

      {/* Centered MultipleOptionCard */}
      <div  style={{ cursor: "pointer" }}
          onClick={handleCardClick} className="absolute top-1/2 left-1/2 transform max-w-[350px] w-full -translate-x-1/2 -translate-y-1/2 z-10 w-full">
        
        <MultipleOptionCard
          imageSrc={imageSrc}
          question={question}
          totalPool={totalPool}
          options={options}
          yesColor={yesColor}
          noColor={noColor}
          yesHoverBg={yesHoverBg}
          noHoverBg={noHoverBg}
          onYesClick={onYesClick}
          onNoClick={onNoClick}
          forecast={forecast}
        />
      </div>
    </Card>
  );
}