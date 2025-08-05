"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card";

import { ScrollArea } from "@/app/components/ui/scroll-area";
import { decimalToPercentage, toTwoDecimal } from "@/utils/helpers";
// import Polymarket from "/public/images/polymarket.png";
import { BookmarkFilledIcon, BookmarkIcon } from "@radix-ui/react-icons";
import SpotifyLogo from "../../../public/images/spotifylogo.png";

interface Option {
  groupItemTitle?: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  outcomePrices?: string;
  outcomes?: string;
  button1label?: string;
  button2label?: string;
  [key: string]: any;
}

interface MultipleOptionCardProps {
  imageSrc: string;
  question: string;
  totalPool?: string;
  options: Option[];
  forecast?: boolean;
  onYesClick?: (option: Option) => void;
  onNoClick?: (option: Option) => void;
  yesColor?: string;
  noColor?: string;
  yesHoverBg?: string;
  noHoverBg?: string;
  id?: string | number;
  status: string;
}

export function MultipleOptionCard({
  imageSrc,
  question,
  totalPool,
  options,
  forecast = false,
  yesColor = "#7dfdfe",
  noColor = "pink",
  yesHoverBg = "#244445",
  noHoverBg = "#430a36",
  onYesClick,
  onNoClick,
  status,
}: MultipleOptionCardProps) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = React.useState(false);
  const handleYesClick = (option: Option) => {
    if (onYesClick) {
      onYesClick(option);
    } else {
      router.push("/eventPage");
    }
  };

  const handleNoClick = (option: Option) => {
    if (onNoClick) {
      onNoClick(option);
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
      className="flex flex-col w-full h-[180px] justify-between lg:rounded-lg rounded-[11.5px]"
      style={{
        backgroundColor: "#000000",
        position: "relative",
        zIndex: 1001,
        boxShadow: "0 2px 6px 0 rgba(220,220,255,0.13)",
      }}
    >
      <CardHeader className="sm:pt-3 sm:pl-3 sm:pr-3 pl-2 pr-2 pt-2 pb-0">
        <CardTitle style={{ lineHeight: "1.5" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                overflow: "hidden",
                borderRadius: "6px",
                flexShrink: 0,
              }}
            >
              <img
                src={imageSrc}
                alt="Event"
                width={40}
                height={40}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div className="pl-2 text-[13px]" style={{ marginRight: "8px" }}>
              {question}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0 sm:pl-3 sm:pr-3 pl-2 pr-2 pt-2 sm:pt-3">
        <div className="relative group">
          <ScrollArea className="sm:h-[75px] h-[70px] group-hover:h-[78px] overflow-hidden top-0 ease-in-out absolute bottom-full left-0 w-full border bg-[#0f0f0f] pb-0 transition-all z-10 duration-200 rounded-sm">
            <div className="space-y-1 top-0 pr-2">
              {options?.map((option, index) => {
                const question =
                  option.groupItemTitle ||
                  option.option1 ||
                  option.option2 ||
                  option.option3 ||
                  option.option4;

                return (
                  <div
                    className="w-full"
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {/* Artist Name Display */}
                    <div
                      className="text-[12px] w-full mb-0 text-bold pb-0 pt-1"
                      style={{ width: "31%", textAlign: "center" }}
                    >
                      {question}
                    </div>

                    {status == "active" ? (
                      <div className="flex justify-center items-center align-middle gap-1">
                        <p>
                          {option.last
                            ? // decimalToPercentage(
                              //   JSON.parse(option.outcomePrices)[0]
                              // ) + "%"
                              `${option.last}%`
                            : ""}
                        </p>
                        {/* Yes Button */}
                        {/* Yes Button */}
                        <div
                          className="text-[8px]"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "45%", // increased from 31%
                          }}
                        >
                          <Button
                            onClick={() => handleYesClick(option)}
                            className="w-full h-[12px] py-[13px] mb-1 bg-[#0d1a26] text-[#7dfdfe] hover:bg-[#0d1a26] text-[10px] transition-colors duration-300 rounded-md border border-transparent hover:border-[#7DFDFE] hover:border-[1.5px] capitalize"
                          >
                            {(option.outcome && option.outcome?.[0]?.title) ||
                              "Yes"}
                          </Button>
                        </div>

                        {/* No Button */}
                        <div
                          className="text-[8px]"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "45%", // same width for symmetry
                          }}
                        >
                          <Button
                            onClick={() => handleNoClick(option)}
                            className="w-full h-[12px] py-[13px] mb-1 bg-[#210d1a] text-[#ec4899] hover:bg-[#210d1a] text-[10px] transition-colors duration-300 rounded-md border border-transparent hover:border-[#ec4899] hover:border-[1.5px] capitalize"
                          >
                            {(option.outcome && option.outcome?.[1]?.title) ||
                              "No"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#ec4899] text-[10px]">NBA</span>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="relative z-0 sm:pl-3 pl-2 sm:pr-3 pr-2 pb-2 px-2 overflow-hidden">
        <div
          className="pt-2 sm:pt-2 pb-0 w-full"
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
            {status == "active" && (
              <CardDescription>
                $
                {totalPool
                  ? (parseFloat(totalPool) / 100)?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}{" "}
                Vol
              </CardDescription>
            )}
          </span>
          <div className="flex gap-2 items-center justify-end">
            {forecast && (
              <div className="">
                <Image
                  src={SpotifyLogo}
                  alt="Spotify"
                  width={20}
                  height={20}
                  className="opacity-70 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            )}
            {/* <Button
              className="p-1 h-6 w-6  z-10 rounded"
              variant="ghost"
              onClick={handleBookmarkClick}
            >
              {bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </Button> */}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
