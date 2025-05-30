"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
// import Polymarket from "/public/images/polymarket.png";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { decimalToPercentage, toTwoDecimal } from "@/utils/helpers";

interface EventCardProps {
  imageSrc: string;
  question: string;
  probability?: number;
  totalPool?: string;
  yesButtonLabel?: string;
  noButtonLabel?: string;
  yesPotential?: number | string;
  noPotential?: number | string;
  yesColor?: string;
  noColor?: string;
  yesHoverBg?: string;
  noHoverBg?: string;
  onYesClick?: () => void;
  onNoClick?: () => void;
  id?: string | number;
}

const EventCard: React.FC<EventCardProps> = ({
  imageSrc,
  question,
  probability,
  totalPool,
  yesButtonLabel = "Yes 24.0¢",
  noButtonLabel = "No 76.0¢",
  yesPotential,
  noPotential,
  yesColor = "#7dfdfe",
  noColor = "pink",
  yesHoverBg = "#244445",
  noHoverBg = "#430a36",
  onYesClick,
  onNoClick,
  id,
}) => {
  const router = useRouter();

  const handleYesClick = () => {
    if (onYesClick) {
      onYesClick();
    } else {
      router.push("/eventPage");
    }
  };

  const handleNoClick = () => {
    if (onNoClick) {
      onNoClick();
    } else {
      router.push("/eventPage");
    }
  };

  return (
    <Card
      className="flex flex-col justify-between w-full h-[200px] sm:h-[200px]"
      style={{ backgroundColor: "#161616" }}
    >
      <CardHeader className="sm:pt-3 sm:pl-3 pl-3 sm:pr-3 pr-3 pt-3 pb-0">
        <CardTitle style={{ lineHeight: "1.5" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                overflow: "hidden",
                borderRadius: "4px",
                flexShrink: 0,
              }}
            >
              <Image
                src={imageSrc}
                alt="Event"
                width={38}
                height={38}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div
              className="pl-1 text-[14px]"
              style={{
                paddingLeft: "8px",
                marginRight: "10px",
                flexGrow: 1, // Push probability to the end
              }}
            >
              {question}
            </div>
            <div>{probability && decimalToPercentage(probability)}%</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0 sm:pl-3 pl-3 sm:pr-3 pr-3">
        <div className="pb-4 pt-1">
          <Progress
            value={probability && decimalToPercentage(probability)}
            className="w-[100%]"
          />
        </div>
        <div
          className="pb-0"
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Yes Button */}
          <div
            className="text-[12px]"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "48%",
            }}
          >
            <Button
              onClick={handleYesClick}
              className="w-full mb-1 bg-[#152632] text-[#7dfdfe] hover:bg-[#7dfdfe] hover:text-[#152632] transition-colors duration-300 rounded-full uppercase"
            >
              {yesButtonLabel}
            </Button>
          </div>

          {/* No Button */}
          <div
            className="text-[12px]"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "48%",
            }}
          >
            <Button
              onClick={handleNoClick}
              className="w-full mb-1 bg-[#321b29] text-[#ec4899] hover:bg-[#ec4899] hover:text-[#321b29] transition-colors duration-300 rounded-full uppercase"
            >
              {noButtonLabel}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="sm:pl-3 pl-3 sm:pr-3 pr-3 pb-2 overflow-hidden">
        <div
          className="pb-0 w-full"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              maxWidth: "50%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {totalPool && <CardDescription>{totalPool} Vol</CardDescription>}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
