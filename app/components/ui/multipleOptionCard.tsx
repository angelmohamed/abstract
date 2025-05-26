'use client';

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
  onYesClick?: (option: Option) => void;
  onNoClick?: (option: Option) => void;
  yesColor?: string;
  noColor?: string;
  yesHoverBg?: string;
  noHoverBg?: string;
  id?: string | number;
}

export function MultipleOptionCard({
  imageSrc,
  question,
  totalPool,
  options,
  yesColor = "#7DFDFE",
  noColor = "pink",
  yesHoverBg = "#244445",
  noHoverBg = "#430a36",
  onYesClick,
  onNoClick,
}: MultipleOptionCardProps) {
  const router = useRouter();

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

  return (
    <Card className="flex flex-col w-full h-[200px] sm:h-[230px] justify-between" style={{ backgroundColor: "#161616", position: 'relative', zIndex: 1001 }}>
      <CardHeader className="sm:pt-5 sm:pl-5 pl-3 s:pr-5 pr-3 pt-3 pb-0">
        <CardTitle style={{ lineHeight: "1.5" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
          <div 
            style={{ 
              width: "55px", 
              height: "55px", 
              overflow: "hidden", 
              borderRadius: "8px", 
              flexShrink: 0 
            }}
          >
            <Image 
              src={imageSrc} 
              alt="Event" 
              width={55} 
              height={55} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>

            <div className="pl-1 text-[14px]" style={{ marginRight: "10px" }}>
              {question}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-0 sm:pl-5 pl-3 s:pr-5 pr-3 pt-2 sm:pt-3">
      <div className="relative group">

        <ScrollArea className="sm:h-[85px] h-[80px] group-hover:h-[95px] overflow-hidden top-0 relative ease-in-out absolute bottom-full left-0 w-full border bg-[#0f0f0f] pb-0 transition-all z-10 duration-200"  >
          <div className="space-y-1 top-0">
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

                  <div className="flex justify-center items-center align-middle gap-1">
                    <p>
                      {option.outcomePrices &&
                        decimalToPercentage(
                          JSON.parse(option.outcomePrices)[0]
                        ) + "%"}
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
                      className="w-full h-[12px] py-[13px] mb-1 bg-[#152632] text-[#7dfdfe] hover:bg-[#e0e0e0] text-[10px] transition-colors duration-300 rounded-full"
                    >
                      {option.outcome && option.outcome?.[0]?.title || "Yes"}
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
                      className="w-full h-[12px] py-[13px] mb-1 bg-[#321b29] text-[#ec4899] hover:bg-[#e0e0e0] text-[10px] transition-colors duration-300 rounded-full"
                    >
                      {option.outcome && option.outcome?.[1]?.title || "No"}
                    </Button>
                  </div>


                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="relative z-0 sm:pl-5 pl-3 s:pr-5 pr-3 pb-2 px-3 overflow-hidden">
        <div className="pt-2 sm:pt-2 pb-0 w-full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '12px', maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {totalPool && <CardDescription>{totalPool} Vol</CardDescription>}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}