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
  rawTimestamp?: number;
  formattingInterval?: string;
}

// 添加 ChartDataPoint 接口定义
export interface ChartDataPoint {
  timestamp: string;
  asset1: number | null;
  [key: string]: any;
}

export function processMultiChartData(
  data1: DataPoint[] = [],
  data2: DataPoint[] = [],
  data3: DataPoint[] = [],
  data4: DataPoint[] = [],
  interval = "all"
): (ChartDataItem & { rawTimestamp: number; formattingInterval?: string })[] {
  if (data1.length === 0 && data2.length === 0 && data3.length === 0 && data4.length === 0) return [];
  const now = Math.floor(Date.now() / 1000);
  
  // Calculate actual data range
  const allDataTimestamps = [
    ...data1.map(d => d.t),
    ...data2.map(d => d.t),
    ...data3.map(d => d.t),
    ...data4.map(d => d.t)
  ].filter(t => t !== undefined);
  
  const firstDataPoint = Math.min(...allDataTimestamps);
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

  // Sort all data by timestamp
  const sorted1 = [...data1].sort((a, b) => a.t - b.t);
  const sorted2 = [...data2].sort((a, b) => a.t - b.t);
  const sorted3 = [...data3].sort((a, b) => a.t - b.t);
  const sorted4 = [...data4].sort((a, b) => a.t - b.t);

    // Find forward-fill baseline values from the last data point before startTime for each dataset
  let last1 = sorted1[0]?.p * 100 || 0;
  let last2 = sorted2[0]?.p * 100 || 0;
  let last3 = sorted3[0]?.p * 100 || 0;
  let last4 = sorted4[0]?.p * 100 || 0;
  let idx1 = 0, idx2 = 0, idx3 = 0, idx4 = 0;

  // Handle baseline values based on interval type
  if (adjustedInterval === "all" || intervalSec > actualRangeSec) {
    // Start from the very first data points
    idx1 = 0; idx2 = 0; idx3 = 0; idx4 = 0;
    last1 = sorted1[0]?.p * 100 || 0;
    last2 = sorted2[0]?.p * 100 || 0;
    last3 = sorted3[0]?.p * 100 || 0;
    last4 = sorted4[0]?.p * 100 || 0;
    // Use the earliest data point as start time
    const allFirstPoints = [
      sorted1[0]?.t,
      sorted2[0]?.t,
      sorted3[0]?.t,
      sorted4[0]?.t
    ].filter(t => t !== undefined);
    if (allFirstPoints.length > 0) {
      startTime = Math.min(...allFirstPoints);
    }
  } else {
    // For specific intervals, find the last value before our start time
    for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i].t < startTime) {
        last1 = sorted1[i].p * 100;
        idx1 = i + 1;
      } else break;
    }
    for (let i = 0; i < sorted2.length; i++) {
      if (sorted2[i].t < startTime) {
        last2 = sorted2[i].p * 100;
        idx2 = i + 1;
      } else break;
    }
    for (let i = 0; i < sorted3.length; i++) {
      if (sorted3[i].t < startTime) {
        last3 = sorted3[i].p * 100;
        idx3 = i + 1;
      } else break;
    }
    for (let i = 0; i < sorted4.length; i++) {
      if (sorted4[i].t < startTime) {
        last4 = sorted4[i].p * 100;
        idx4 = i + 1;
      } else break;
    }
  }

  let result: (ChartDataItem & { rawTimestamp: number; formattingInterval?: string })[] = [];

  // Collect all unique timestamps from all datasets
  const allTimestamps = new Set<number>();
  
  // Add starting point timestamp
  allTimestamps.add(startTime);
  
  if (adjustedInterval === "all" || intervalSec > actualRangeSec) {
    // For "all" or when timeframe is smaller than interval, include ALL data points
    for (let i = 0; i < sorted1.length && sorted1[i].t <= now; i++) {
      allTimestamps.add(sorted1[i].t);
    }
    for (let i = 0; i < sorted2.length && sorted2[i].t <= now; i++) {
      allTimestamps.add(sorted2[i].t);
    }
    for (let i = 0; i < sorted3.length && sorted3[i].t <= now; i++) {
      allTimestamps.add(sorted3[i].t);
    }
    for (let i = 0; i < sorted4.length && sorted4[i].t <= now; i++) {
      allTimestamps.add(sorted4[i].t);
    }
  } else {
    // For specific intervals, include data points from idx onwards
    for (let i = idx1; i < sorted1.length && sorted1[i].t <= now; i++) {
      allTimestamps.add(sorted1[i].t);
    }
    for (let i = idx2; i < sorted2.length && sorted2[i].t <= now; i++) {
      allTimestamps.add(sorted2[i].t);
    }
    for (let i = idx3; i < sorted3.length && sorted3[i].t <= now; i++) {
      allTimestamps.add(sorted3[i].t);
    }
    for (let i = idx4; i < sorted4.length && sorted4[i].t <= now; i++) {
      allTimestamps.add(sorted4[i].t);
    }
  }
  
  // Add current time
  allTimestamps.add(now);

  // Sort all unique timestamps
  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  // Process each timestamp and forward-fill values
  let currentIdx1 = idx1, currentIdx2 = idx2, currentIdx3 = idx3, currentIdx4 = idx4;
  let currentVal1 = last1, currentVal2 = last2, currentVal3 = last3, currentVal4 = last4;

  for (const timestamp of sortedTimestamps) {
    // Update values based on any new data points up to this timestamp
    while (currentIdx1 < sorted1.length && sorted1[currentIdx1].t <= timestamp) {
      currentVal1 = sorted1[currentIdx1].p * 100;
      currentIdx1++;
    }
    while (currentIdx2 < sorted2.length && sorted2[currentIdx2].t <= timestamp) {
      currentVal2 = sorted2[currentIdx2].p * 100;
      currentIdx2++;
    }
    while (currentIdx3 < sorted3.length && sorted3[currentIdx3].t <= timestamp) {
      currentVal3 = sorted3[currentIdx3].p * 100;
      currentIdx3++;
    }
    while (currentIdx4 < sorted4.length && sorted4[currentIdx4].t <= timestamp) {
      currentVal4 = sorted4[currentIdx4].p * 100;
      currentIdx4++;
    }

    const date = new Date(timestamp * 1000);
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
        hour12: true
      });
    }

    result.push({
      rawTimestamp: timestamp,
      timestamp: timestampString,
      asset1: currentVal1,
      asset2: currentVal2,
      asset3: currentVal3,
      asset4: currentVal4,
      formattingInterval,
    });
  }

  // Remove duplicates and sort
  const seen = new Set();
  result = result.filter(pt => {
    if (seen.has(pt.rawTimestamp)) return false;
    seen.add(pt.rawTimestamp);
    return true;
  });
  result.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  return result;
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
    case "1h": return 2 * 60; // 2 minutes (increased from 30 seconds)
    case "6h": return 10 * 60; // 10 minutes (increased from 1 minute)
    case "1d": return 30 * 60; // 30 minutes (increased from 2 minutes)
    case "1w": return 2 * 60 * 60; // 2 hours (increased from 10 minutes)
    case "1m": return 6 * 60 * 60; // 6 hours (increased from 1 hour)
    case "all":
      // Use range-based thresholds for "all" with more frequent points
      if (rangeSec <= 60 * 60) return 2 * 60; // 0-1h: 2 minutes
      if (rangeSec <= 6 * 60 * 60) return 10 * 60; // 1h-6h: 10 minutes
      if (rangeSec <= 24 * 60 * 60) return 30 * 60; // 6h-1d: 30 minutes
      if (rangeSec <= 7 * 24 * 60 * 60) return 2 * 60 * 60; // 1d-1w: 2 hours
      if (rangeSec <= 30 * 24 * 60 * 60) return 6 * 60 * 60; // 1w-1m: 6 hours
      if (rangeSec <= 3 * 30 * 24 * 60 * 60) return 12 * 60 * 60; // 1m-3m: 12 hours
      return 24 * 60 * 60; // >3m: 24 hours
    default: return 60 * 60; // fallback 1 hour
  }
}

export function processSingleChartData(
  data1: DataPoint[] = [],
  interval: string
): (ChartDataPoint & { rawTimestamp: number; formattingInterval?: string })[] {
  if (!data1.length) return [];
  const now = Math.floor(Date.now() / 1000);
  const firstDataPoint = Math.min(...data1.map(d => d.t));
  const actualRangeSec = now - firstDataPoint;

  const adjustedInterval = getAdjustedInterval(interval, actualRangeSec);
  const intervalSec = getIntervalSeconds(adjustedInterval);

  // Start exactly X hours ago for specific intervals
  let startTime = adjustedInterval === "all" ? firstDataPoint : now - intervalSec;
  if (adjustedInterval !== "all" && intervalSec > actualRangeSec) {
    startTime = firstDataPoint;
  }

  const rangeSec = now - startTime;
  const formattingInterval = getFormattingInterval(rangeSec);

  const sorted = [...data1].sort((a, b) => a.t - b.t);

  // For "all" or when interval is larger than data range, start from first data point
  let lastValue = sorted[0]?.p * 100 || 0;
  let dataIdx = 0;
  
  if (adjustedInterval === "all" || intervalSec > actualRangeSec) {
    // Start from the very first data point
    dataIdx = 0;
    lastValue = sorted[0]?.p * 100 || 0;
    startTime = sorted[0]?.t || startTime;
  } else {
    // For specific intervals, find the last value before our start time
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].t < startTime) {
        lastValue = sorted[i].p * 100;
        dataIdx = i + 1;
      } else {
        break;
      }
    }
  }

  let result: (ChartDataPoint & { rawTimestamp: number; formattingInterval?: string })[] = [];

  // Only include real data points - let step chart handle the connections
  const realDataPoints: { timestamp: number; value: number }[] = [];
  
  // Add start point with baseline value (only if not starting from first data point)
  if (adjustedInterval !== "all" && intervalSec <= actualRangeSec) {
    realDataPoints.push({ timestamp: startTime, value: lastValue });
  }
  
  // Add all real data points within range
  if (adjustedInterval === "all" || intervalSec > actualRangeSec) {
    // For "all" or when timeframe is smaller than interval, include ALL data points
    for (let i = 0; i < sorted.length && sorted[i].t <= now; i++) {
      realDataPoints.push({ timestamp: sorted[i].t, value: sorted[i].p * 100 });
    }
  } else {
    // For specific intervals, include data points from dataIdx onwards
    for (let i = dataIdx; i < sorted.length && sorted[i].t <= now; i++) {
      realDataPoints.push({ timestamp: sorted[i].t, value: sorted[i].p * 100 });
    }
  }
  
  // Add current time point with final value
  const finalValue = sorted.length > 0 ? sorted[sorted.length - 1].p * 100 : lastValue;
  if (realDataPoints.length === 0 || realDataPoints[realDataPoints.length - 1].timestamp !== now) {
    realDataPoints.push({ timestamp: now, value: finalValue });
  }

  // Convert to final format
  for (const point of realDataPoints) {
    const date = new Date(point.timestamp * 1000);
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
        hour12: true
      });
    }

    result.push({
      rawTimestamp: point.timestamp,
      timestamp: timestampString,
      asset1: point.value,
      formattingInterval,
    });
  }

  // Remove duplicates and sort
  const seen = new Set();
  result = result.filter(pt => {
    if (seen.has(pt.rawTimestamp)) return false;
    seen.add(pt.rawTimestamp);
    return true;
  });
  result.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  return result;
}