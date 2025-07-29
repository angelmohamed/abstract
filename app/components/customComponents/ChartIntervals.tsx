"use client";

import { Button } from "../ui/button";

interface ChartIntervalsProps {
  interval: string;
  setInterval: (interval: string) => void;
  isAllDisable?: any
}

const ChartIntervals: React.FC<ChartIntervalsProps> = ({ interval, setInterval, isAllDisable }) => {
  return (
    <div className="mt-2 mb-0 flex gap-2 justify-center">
      <Button
        id="1h"
        variant={interval === "1h" ? "default" : "outline"}
        onClick={() => setInterval("1h")}
        className="rounded-full px-3 py-1 text-xs"
      >
        1H
      </Button>
      <Button
        id="6h"
        variant={interval === "6h" ? "default" : "outline"}
        onClick={() => setInterval("6h")}
        className="rounded-full px-3 py-1 text-xs"
      >
        6H
      </Button>
      <Button
        id="1d"
        variant={interval === "1d" ? "default" : "outline"}
        onClick={() => setInterval("1d")}
        className="rounded-full px-3 py-1 text-xs"
      >
        1D
      </Button>
      <Button
        id="1w"
        variant={interval === "1w" ? "default" : "outline"}
        onClick={() => setInterval("1w")}
        className="rounded-full px-3 py-1 text-xs"
      >
        1W
      </Button>
      <Button
        id="1m"
        variant={interval === "1m" ? "default" : "outline"}
        onClick={() => setInterval("1m")}
        className="rounded-full px-3 py-1 text-xs"
      >
        1M
      </Button>
      {!isAllDisable && (
        <Button
          id="All"
          variant={interval === "max" ? "default" : "outline"}
          onClick={() => setInterval("max")}
          className="rounded-full px-3 py-1 text-xs"
        >
          ALL
        </Button>
      )}
    </div>
  );
};

export default ChartIntervals;
