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
  asset1: number | null;
  [key: string]: any;
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

export function processSingleChartData(
  data1: DataPoint[] = [],
  interval: string
): ChartDataPoint[] {
  const allTimestamps = new Set([...data1.map((d) => d.t)]);

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
          decimalToPercentage(data1.find((d) => d.t === timestamp)?.p) ?? null,
      };
    });
}
