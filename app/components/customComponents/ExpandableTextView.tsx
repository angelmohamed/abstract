"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/app/components/ui/button";

interface ExpandableTextViewProps {
  children: ReactNode;
}

export default function ExpandableTextView({ children }: ExpandableTextViewProps) {
  const [showFullText, setShowFullText] = useState<boolean>(false);
  
  return (
    <div className="space-y-0">
      <div
        className={`line-clamp-5 transition-all duration-300 ${
          showFullText ? "line-clamp-none" : ""
        }`}
      >
        {children}
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant="link"
          onClick={() => setShowFullText(!showFullText)}
          className="text-sm text-primary"
        >
          {showFullText ? "Show Less" : "Show More"}
        </Button>
      </div>
    </div>
  );
}