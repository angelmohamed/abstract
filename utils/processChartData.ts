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
        result[`asset${data.indexOf(market) + 1}`] = match?.p ?? null;
        //previous price is the price of the current market here
        // previousPrice[`asset${data.indexOf(market) + 1}`] = match?.p ?? previousPrice[`asset${data.indexOf(market) + 1}`];
      }
      
      return result;
    });
}
