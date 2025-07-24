import { toFixedDown } from "@/lib/roundOf";
import { decimalToPercentage } from "@/utils/helpers";
interface DataPoint {
  t: number;
  p: number;
}

// 添加 ChartDataItem 接口定义
export interface ChartDataItem {
  timestamp: string;
  asset1: number | null;
  asset2: number | null;
  asset3: number | null;
  asset4: number | null;
}

// 添加 ChartDataPoint 接口定义
export interface ChartDataPoint {
  timestamp: string;
  [market: string]: string | number | null;
}

export function processMultiChartData(
  data1: DataPoint[] = [],
  data2: DataPoint[] = [],
  data3: DataPoint[] = [],
  data4: DataPoint[] = [],
  interval = "max"
): ChartDataItem[] {
  const allTimestamps = new Set([
    ...data1?.map((d) => d?.t),
    ...data2?.map((d) => d?.t),
    ...data3?.map((d) => d?.t),
    ...data4?.map((d) => d?.t),
  ]);

  return Array.from(allTimestamps)
    .sort((a, b) => a - b)
    .map((timestamp) => {
      const date = new Date(timestamp * 1000);
      let timestampString = "";
      if (interval === "max" || interval === "1m" || interval === "1w") {
        timestampString = date.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
        });
      } else {
        timestampString = date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
        });
      }

      return {
        timestamp: timestampString,
        asset1:
          decimalToPercentage(data1.find((d) => d?.t === timestamp)?.p) ?? null,
        asset2:
          decimalToPercentage(data2.find((d) => d?.t === timestamp)?.p) ?? null,
        asset3:
          decimalToPercentage(data3.find((d) => d?.t === timestamp)?.p) ?? null,
        asset4:
          decimalToPercentage(data4.find((d) => d?.t === timestamp)?.p) ?? null,
      };
    });
}

export function processMultiChartDataNew(
  datasets: DataPoint[][] = [],
  interval = "all"
): (ChartDataItem & { rawTimestamp: number; formattingInterval?: string })[] {
  if (datasets.length === 0 || datasets.every(ds => ds.length === 0)) return [];

  const now = Math.floor(Date.now() / 1000);

  // Calculate actual data range
  const allTimestamps = datasets.flatMap(ds => ds.map(d => d.t)).filter(t => t !== undefined);
  const firstDataPoint = Math.min(...allTimestamps);
  const actualRangeSec = now - firstDataPoint;

  const adjustedInterval = getAdjustedInterval(interval, actualRangeSec);
  const intervalSec = getIntervalSeconds(adjustedInterval);

  let startTime = adjustedInterval === "all" ? firstDataPoint : now - intervalSec;
  if (adjustedInterval !== "all" && intervalSec > actualRangeSec) {
    startTime = firstDataPoint;
  }

  const rangeSec = now - startTime;
  const step = getFixedStep(adjustedInterval, rangeSec);
  const formattingInterval = getFormattingInterval(rangeSec);

  const sortedData = datasets.map(ds => [...ds].sort((a, b) => a.t - b.t));

  const lastValues: (number | null)[] = sortedData.map(ds => (ds.length > 0 ? ds[0].p : null));
  const indices: number[] = new Array(datasets.length).fill(0);

  for (let d = 0; d < sortedData.length; d++) {
    for (let i = 0; i < sortedData[d].length; i++) {
      if (sortedData[d][i].t <= startTime) {
        lastValues[d] = sortedData[d][i].p;
        indices[d] = i + 1;
      } else break;
    }
  }

  const result: (ChartDataItem & { rawTimestamp: number; formattingInterval?: string })[] = [];

  const formatTime = (ts: number): string => {
    const date = new Date(ts * 1000);
    if (formattingInterval === "all" || formattingInterval === "1m" || formattingInterval === "1w") {
      return date.toLocaleString("en-US", { day: "numeric", month: "short" });
    }
    return date.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
  };

  const buildItem = (timestamp: number, values: (number | null)[]) => {
    const item: any = {
      rawTimestamp: timestamp,
      timestamp: formatTime(timestamp),
      formattingInterval,
    };
    values.forEach((val, idx) => {
      item[`asset${idx + 1}`] = val;
    });
    return item;
  };

  // 1. Add point at startTime
  result.push(buildItem(startTime, [...lastValues]));

  // 2. Intermediate points
  let t = startTime + step;
  const ffValues = [...lastValues];
  const ffIndices = [...indices];
  for (; t < now; t += step) {
    for (let d = 0; d < sortedData.length; d++) {
      while (ffIndices[d] < sortedData[d].length && sortedData[d][ffIndices[d]].t <= t) {
        ffValues[d] = sortedData[d][ffIndices[d]].p;
        ffIndices[d]++;
      }
    }
    result.push(buildItem(t, [...ffValues]));
  }

  // 3. Add point at now
  for (let d = 0; d < sortedData.length; d++) {
    while (ffIndices[d] < sortedData[d].length && sortedData[d][ffIndices[d]].t <= now) {
      ffValues[d] = sortedData[d][ffIndices[d]].p;
      ffIndices[d]++;
    }
  }
  result.push(buildItem(now, [...ffValues]));

  // Remove duplicates
  const seen = new Set();
  const filtered = result.filter(pt => {
    if (seen.has(pt.rawTimestamp)) return false;
    seen.add(pt.rawTimestamp);
    return true;
  });

  filtered.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  return filtered;
}

export function processSingleChartData(
  data: any,
  interval: string
): ChartDataPoint[] {
  // Collect all unique timestamps from all market series
  const allTimestamps = new Set<number>();
  data.forEach((marketData) => {
    marketData.data.forEach((point) => allTimestamps.add(point.t));
  });

  return Array.from(allTimestamps)
    // .sort((a, b) => a - b)
    .map((timestamp) => {
      const date = new Date(timestamp);
      let timestampString = "";

      if (["max", "1m", "1w"].includes(interval)) {
        timestampString = date.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
        });
      } else {
        timestampString = date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
        });
      }

      const result: ChartDataPoint = {
        timestamp: timestampString,
      };

      // Add price per market
      // const marketKeys = Object.keys(data);
      // let previousPrice = {
      //   asset1: 0,
      //   asset2: 0,
      //   asset3: 0,
      //   asset4: 0,
      // };
      for (const market of data) {
        // let previous = previousPrice[`asset${data.indexOf(market) + 1}`]
        const match = market.data.find((d) => d.t === timestamp);
        result[`asset${data.indexOf(market) + 1}`] = toFixedDown(match?.p , 2) ?? null;
        //previous price is the price of the current market here
        // previousPrice[`asset${data.indexOf(market) + 1}`] = match?.p ?? previousPrice[`asset${data.indexOf(market) + 1}`];
      }
      
      return result;
    });
}

function getIntervalSeconds(interval: string): number {
  switch (interval) {
    case "1h": return 60 * 60;
    case "6h": return 6 * 60 * 60;
    case "1d": return 24 * 60 * 60;
    case "1w": return 7 * 24 * 60 * 60;
    case "1m": return 30 * 24 * 60 * 60;
    case "all": return Number.MAX_SAFE_INTEGER;
    default: return 24 * 60 * 60;
  }
}

function getAdjustedInterval(selectedInterval: string, dataRangeSec: number): string {
  const intervalSec = getIntervalSeconds(selectedInterval);
  if (intervalSec > dataRangeSec) {
    return "all";
  }
  return selectedInterval;
}

function getFormattingInterval(rangeSec: number): string {
  if (rangeSec <= 60 * 60) return "1h"; // 0-1h: format like 1h
  if (rangeSec <= 6 * 60 * 60) return "6h"; // 1h-6h: format like 6h
  if (rangeSec <= 24 * 60 * 60) return "1d"; // 6h-1d: format like 1d
  if (rangeSec <= 7 * 24 * 60 * 60) return "1w"; // 1d-1w: format like 1w
  if (rangeSec <= 30 * 24 * 60 * 60) return "1m"; // 1w-1m: format like 1m
  return "all"; // >1m: format like all
}

function getFixedStep(interval: string, rangeSec: number): number {
  switch (interval) {
    case "1h": return 60; // 1 minute
    case "6h": return 2 * 60; // 2 minutes
    case "1d": return 5 * 60; // 5 minutes
    case "1w": return 30 * 60; // 30 minutes
    case "1m": return 3 * 60 * 60; // 3 hours
    case "all":
      // Use range-based thresholds for "all"
      if (rangeSec <= 60 * 60) return 60; // 0-1h: 1 minute
      if (rangeSec <= 6 * 60 * 60) return 2 * 60; // 1h-6h: 2 minutes
      if (rangeSec <= 24 * 60 * 60) return 5 * 60; // 6h-1d: 5 minutes
      if (rangeSec <= 7 * 24 * 60 * 60) return 30 * 60; // 1d-1w: 30 minutes
      if (rangeSec <= 30 * 24 * 60 * 60) return 3 * 60 * 60; // 1w-1m: 3 hours
      if (rangeSec <= 3 * 30 * 24 * 60 * 60) return 6 * 60 * 60; // 1m-3m: 6 hours
      return 12 * 60 * 60; // >3m: 12 hours
    default: return 60 * 60; // fallback 1 hour
  }
}

export function processSingleChartDataNew(
  data1: any = [],
  interval: string
): (ChartDataPoint & { rawTimestamp: number; formattingInterval?: string })[] {
  if (!data1.length) return [];
  const now = Math.floor(Date.now() / 1000);
  const firstDataPoint = Math.min(...data1.map(d => d.t));
  const actualRangeSec = now - firstDataPoint;
  
  // Check if selected interval is greater than data range, if so use "all"
  const adjustedInterval = getAdjustedInterval(interval, actualRangeSec);
  const intervalSec = getIntervalSeconds(adjustedInterval);
  
  // For "all" or when selected interval is greater than actual data range, use actual range
  let startTime = adjustedInterval === "all" ? firstDataPoint : now - intervalSec;
  if (adjustedInterval !== "all" && intervalSec > actualRangeSec) {
    startTime = firstDataPoint;
  }
  
  const rangeSec = now - startTime;
  const step = getFixedStep(adjustedInterval, rangeSec);
  const formattingInterval = getFormattingInterval(rangeSec);

  // Sort data by timestamp
  const sorted = [...data1].sort((a, b) => a.t - b.t);

  // Find the last value before or at startTime for forward-filling
  let lastValue = sorted[0].p;
  let dataIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].t <= startTime) {
      lastValue = sorted[i].p;
      dataIdx = i + 1;
    } else {
      break;
    }
  }

  let result: (ChartDataPoint & { rawTimestamp: number; formattingInterval?: string })[] = [];

  // 1. Always add a point at startTime (guaranteed)
  {
    const date = new Date(startTime * 1000);
    let timestampString = "";
    if (formattingInterval === "all" || formattingInterval === "1m" || formattingInterval === "1w") {
      timestampString = date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
      });
    } else {
      timestampString = date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    }
    result.push({
      rawTimestamp: startTime,
      timestamp: timestampString,
      asset1: lastValue,
      formattingInterval,
    });
  }

  // 2. Generate points at fixed step between startTime and now (excluding startTime and now)
  let t = startTime + step;
  let ffValue = lastValue;
  let ffIdx = dataIdx;
  for (; t < now; t += step) {
    // Forward-fill for each generated point
    while (ffIdx < sorted.length && sorted[ffIdx].t <= t) {
      ffValue = sorted[ffIdx].p;
      ffIdx++;
    }
    const date = new Date(t * 1000);
      let timestampString = "";
    if (formattingInterval === "all" || formattingInterval === "1m" || formattingInterval === "1w") {
        timestampString = date.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
        });
      } else {
        timestampString = date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
      });
    }
    result.push({
      rawTimestamp: t,
      timestamp: timestampString,
      asset1: ffValue,
      formattingInterval,
    });
  }

  // 3. Always add a point at now (guaranteed)
  {
    // Forward-fill for now
    while (ffIdx < sorted.length && sorted[ffIdx].t <= now) {
      ffValue = sorted[ffIdx].p;
      ffIdx++;
    }
    const date = new Date(now * 1000);
    let timestampString = "";
    if (formattingInterval === "all" || formattingInterval === "1m" || formattingInterval === "1w") {
      timestampString = date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
      });
    } else {
      timestampString = date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
    }
    result.push({
      rawTimestamp: now,
        timestamp: timestampString,
      asset1: ffValue,
      formattingInterval,
    });
  }

  // Remove duplicates (in case)
  const seen = new Set();
  result = result.filter(pt => {
    if (seen.has(pt.rawTimestamp)) return false;
    seen.add(pt.rawTimestamp);
    return true;
  });
  result.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  return result;
}