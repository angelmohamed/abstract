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
  status: string;
  outcome: string;
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
  yesColor = "#7dfdfe",
  noColor = "pink",
  yesHoverBg = "#244445",
  noHoverBg = "#430a36",
  onYesClick,
  onNoClick,
  status,
  id,
  outcome,
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
      className="flex flex-col justify-between w-full h-[180px] hover:bg-[#0a0a0a] transition-colors duration-300"
      style={{
        backgroundColor: "#000000ff",
        boxShadow: "0 2px 6px 0 rgba(220,220,255,0.13)",
      }}
    >
      <CardHeader className="sm:pt-3 sm:pl-3 sm:pr-3 pl-3 pr-3 pt-3 pb-0">
        <CardTitle style={{ lineHeight: "1.5" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
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

            <div
              className="pl-1 text-[14px] sm:text-[13px] line-clamp-2"
              style={{
                paddingLeft: "8px",
                marginRight: "8px",
                flexGrow: 1,
                minWidth: 0,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
              }}
            >
              {question}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 0,
                width: "fit-content",
                marginLeft: "auto",
                flexShrink: 0,
                marginTop: 0,
              }}
            >
              <span
                style={{
                  display: "block",
                  textAlign: "center",
                  width: "100%",
                  marginTop: 0,
                }}
              >
                {status == "active" && (
                  <>{probability ? `${probability}%` : ""}</>
                )}
              </span>
              {probability && probability != 0 ? (
                <Progress
                  // value={probability && decimalToPercentage(probability)}
                  value={probability}
                  className="h-1 w-full"
                  style={{ maxWidth: "3.5em", minWidth: "2em", marginTop: 0 }}
                />
              ) : (
                <Progress
                  // value={probability && decimalToPercentage(probability)}
                  value={0}
                  className="h-1 w-full"
                  style={{ maxWidth: "3.5em", minWidth: "2em", marginTop: 0 }}
                />
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0 sm:pl-3 sm:pr-3 pl-3 pr-3 pt-5 sm:pt-6">
        {status == "active" ? (
          <>
            <div
              className="pb-0 mt-3"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                gap: "10px",
              }}
            >
              {/* Yes Button */}
              <div
                className="text-[12px]"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "50%",
                }}
              >
                <div className="relative w-full mb-1 group">
                  <Button
                    onClick={handleYesClick}
                    className="w-full h-11 sm:h-10 bg-[#0d1a26] text-[#7dfdfe] hover:bg-[#0d1a26] transition-colors duration-300 rounded-md border border-transparent relative z-10 capitalize"
                  >
                    {yesButtonLabel}
                  </Button>
                  {/* Tron blue border animation - hover only */}
                  <div className="absolute inset-0 rounded-md z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 rounded-md border border-[#00d4ff] animate-border-glow"></div>
                    <div className="absolute inset-0 rounded-md">
                      {/* Flowing lines */}
                      <div
                        className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent animate-line-flow"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#00d4ff] to-transparent animate-line-flow-vertical"
                        style={{ animationDelay: "0.7s" }}
                      ></div>
                      <div
                        className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent animate-line-flow"
                        style={{ animationDelay: "1.2s" }}
                      ></div>
                      <div
                        className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#00d4ff] to-transparent animate-line-flow-vertical"
                        style={{ animationDelay: "1.7s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* No Button */}
              <div
                className="text-[12px]"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "50%",
                }}
              >
                <div className="relative w-full mb-1 group">
                  <Button
                    onClick={handleNoClick}
                    className="w-full h-11 sm:h-10 bg-[#210d1a] text-[#ec4899] hover:bg-[#210d1a] transition-colors duration-300 rounded-md border border-transparent relative z-10 capitalize"
                  >
                    {noButtonLabel}
                  </Button>
                  {/* Pink border animation - hover only */}
                  <div className="absolute inset-0 rounded-md z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 rounded-md border border-[#ec4899] animate-border-glow"></div>
                    <div className="absolute inset-0 rounded-md">
                      {/* Flowing lines */}
                      <div
                        className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent animate-line-flow"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#ec4899] to-transparent animate-line-flow-vertical"
                        style={{ animationDelay: "0.7s" }}
                      ></div>
                      <div
                        className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#ec4899] to-transparent animate-line-flow"
                        style={{ animationDelay: "1.2s" }}
                      ></div>
                      <div
                        className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-[#ec4899] to-transparent animate-line-flow-vertical"
                        style={{ animationDelay: "1.7s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : status == "resolved" ? (
          <>
            <div className="pb-4 pt-1 capitalize">
              <p>Outcome</p>
              <p
                className={
                  outcome == "YES" ? "text-[#7dfdfe]" : "text-[#ec4899]"
                }
              >
                {outcome}
              </p>
            </div>
          </>
        ) : (
          status == "closed" && <span>Closed</span>
        )}
      </CardContent>

      <CardFooter className="sm:pl-3 sm:pr-3 pl-3 pr-3 pb-3 sm:pb-2 overflow-hidden">
        <div
          className="w-full"
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
            {status == "active" && totalPool && (
              <CardDescription>{totalPool} Vol</CardDescription>
            )}
          </span>
          {/* <Button
            className="p-1 h-6 w-6  z-10 rounded"
            variant="ghost"
            onClick={handleBookmarkClick}
          >
            {bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </Button> */}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
