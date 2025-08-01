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
  const allTimestamps = [
    ...data1.map(d => d.t),
    ...data2.map(d => d.t),
    ...data3.map(d => d.t),
    ...data4.map(d => d.t)
  ].filter(t => t !== undefined);
  
  const firstDataPoint = Math.min(...allTimestamps);
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

  // Find the last values before or at startTime for forward-filling
  let last1 = sorted1.length > 0 ? sorted1[0].p * 100 : null;
  let last2 = sorted2.length > 0 ? sorted2[0].p * 100 : null;
  let last3 = sorted3.length > 0 ? sorted3[0].p * 100 : null;
  let last4 = sorted4.length > 0 ? sorted4[0].p * 100 : null;

  let idx1 = 0, idx2 = 0, idx3 = 0, idx4 = 0;
  for (let i = 0; i < sorted1.length; i++) {
    if (sorted1[i].t <= startTime) {
      last1 = sorted1[i].p * 100;
      idx1 = i + 1;
    } else break;
  }
  for (let i = 0; i < sorted2.length; i++) {
    if (sorted2[i].t <= startTime) {
      last2 = sorted2[i].p * 100;
      idx2 = i + 1;
    } else break;
  }
  for (let i = 0; i < sorted3.length; i++) {
    if (sorted3[i].t <= startTime) {
      last3 = sorted3[i].p * 100;
      idx3 = i + 1;
    } else break;
  }
  for (let i = 0; i < sorted4.length; i++) {
    if (sorted4[i].t <= startTime) {
      last4 = sorted4[i].p * 100;
      idx4 = i + 1;
    } else break;
  }

  let result: (ChartDataItem & { rawTimestamp: number; formattingInterval?: string })[] = [];

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
      asset1: last1,
      asset2: last2,
      asset3: last3,
      asset4: last4,
      formattingInterval,
    });
  }

  // 2. Generate points at fixed step between startTime and now (excluding startTime and now)
  let t = startTime + step;
  let ff1 = last1, ff2 = last2, ff3 = last3, ff4 = last4;
  let ffIdx1 = idx1, ffIdx2 = idx2, ffIdx3 = idx3, ffIdx4 = idx4;
  for (; t < now; t += step) {
    // Forward-fill for each generated point
    while (ffIdx1 < sorted1.length && sorted1[ffIdx1].t <= t) {
      ff1 = sorted1[ffIdx1].p * 100;
      ffIdx1++;
    }
    while (ffIdx2 < sorted2.length && sorted2[ffIdx2].t <= t) {
      ff2 = sorted2[ffIdx2].p * 100;
      ffIdx2++;
    }
    while (ffIdx3 < sorted3.length && sorted3[ffIdx3].t <= t) {
      ff3 = sorted3[ffIdx3].p * 100;
      ffIdx3++;
    }
    while (ffIdx4 < sorted4.length && sorted4[ffIdx4].t <= t) {
      ff4 = sorted4[ffIdx4].p * 100;
      ffIdx4++;
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
      asset1: ff1,
      asset2: ff2,
      asset3: ff3,
      asset4: ff4,
      formattingInterval,
    });
  }

  // 3. Always add a point at now (guaranteed)
  {
    // Forward-fill for now
    while (ffIdx1 < sorted1.length && sorted1[ffIdx1].t <= now) {
      ff1 = sorted1[ffIdx1].p * 100;
      ffIdx1++;
    }
    while (ffIdx2 < sorted2.length && sorted2[ffIdx2].t <= now) {
      ff2 = sorted2[ffIdx2].p * 100;
      ffIdx2++;
    }
    while (ffIdx3 < sorted3.length && sorted3[ffIdx3].t <= now) {
      ff3 = sorted3[ffIdx3].p * 100;
      ffIdx3++;
    }
    while (ffIdx4 < sorted4.length && sorted4[ffIdx4].t <= now) {
      ff4 = sorted4[ffIdx4].p * 100;
      ffIdx4++;
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
      asset1: ff1,
      asset2: ff2,
      asset3: ff3,
      asset4: ff4,
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

  let startTime = adjustedInterval === "all" ? firstDataPoint : now - intervalSec;
  if (adjustedInterval !== "all" && intervalSec > actualRangeSec) {
    startTime = firstDataPoint;
  }

  const rangeSec = now - startTime;
  const step = getFixedStep(adjustedInterval, rangeSec);
  const formattingInterval = getFormattingInterval(rangeSec);

  const sorted = [...data1].sort((a, b) => a.t - b.t);

  let lastValue = sorted[0].p * 100;
  let dataIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].t <= startTime) {
      lastValue = sorted[i].p * 100;
      dataIdx = i + 1;
    } else {
      break;
    }
  }

  let result: (ChartDataPoint & { rawTimestamp: number; formattingInterval?: string })[] = [];

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

  let t = startTime + step;
  let ffValue = lastValue;
  let ffIdx = dataIdx;
  for (; t < now; t += step) {
    while (ffIdx < sorted.length && sorted[ffIdx].t <= t) {
      ffValue = sorted[ffIdx].p * 100;
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

  {
    while (ffIdx < sorted.length && sorted[ffIdx].t <= now) {
      ffValue = sorted[ffIdx].p * 100;
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

  const seen = new Set();
  result = result.filter(pt => {
    if (seen.has(pt.rawTimestamp)) return false;
    seen.add(pt.rawTimestamp);
    return true;
  });
  result.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
  return result;
}