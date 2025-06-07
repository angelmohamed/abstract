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
import { BookmarkFilledIcon, BookmarkIcon } from "@radix-ui/react-icons";

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
  yesButtonLabel = "Buy Yes",
  noButtonLabel = "Buy No",
  yesPotential,
  noPotential,
  yesColor = "#27ae60",
  noColor = "pink",
  yesHoverBg = "#244445",
  noHoverBg = "#430a36",
  onYesClick,
  onNoClick,
  id,
}) => {
  const router = useRouter();
  const [bookmarked, setBookmarked] = React.useState(false);

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

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => !prev);
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
              {/* <Image
                src={imageSrc}
                alt="Event"
                width={38}
                height={38}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              /> */}
              <img
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
            {/* <div>{probability && decimalToPercentage(probability)}%</div> */}
            <div>{probability ? `${probability}%` : ""}</div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0 sm:pl-3 pl-3 sm:pr-3 pr-3">
        <div className="pb-4 pt-1">
          {(probability && probability != 0) ? (
            <Progress
              // value={probability && decimalToPercentage(probability)}
              value={probability}
              className="w-[100%]"
            />
           ) : null} 
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
              className="w-full mb-1 bg-[#1f3e2c] text-[#27ae60] hover:bg-[#27ae60] hover:text-[#1f3e2c] transition-colors duration-300 rounded-full capitalize"
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
              className="w-full mb-1 bg-[#362020] text-[#e64800] hover:bg-[#e64800] hover:text-[#362020] transition-colors duration-300 rounded-full capitalize"
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
            position: "relative",
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
          <Button
            className="p-1 h-6 w-6  z-10 rounded"
            variant="ghost"
            onClick={handleBookmarkClick}
          >
            {bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
