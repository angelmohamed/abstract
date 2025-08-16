export function decimalToPercentage(decimal) {
  // Multiply by 100 to convert to a percentage
  const percentage = decimal * 100;
  // Round to the nearest whole number
  const roundedPercentage = Math.round(percentage);
  // Add the percentage sign
  return roundedPercentage;
}

export function toTwoDecimal(decimal) {
  // Round to the nearest whole number
  const roundedPercentage = Math.round(decimal * 100) / 100;
  // Add the percentage sign
  return roundedPercentage;
}

export function sellFunction(data, sharesToSell) {
  if (!data) return { totalValue: 0, averagePrice: 0 };
  if (data?.length === 0) return { totalValue: 0, averagePrice: 0 };
  // Sort data by price in descending order
  const sortedData = [...data].sort(
    (a, b) => parseFloat(b.price) - parseFloat(a.price)
  );

  let remainingShares = sharesToSell;
  let totalValue = 0;
  let totalSharesSold = 0;

  for (const order of sortedData) {
    const price = parseFloat(order.price);
    const size = parseFloat(order.size);

    if (remainingShares <= 0) {
      break; // Stop if no more shares are left to sell
    }

    // Calculate the maximum number of shares we can sell at this price
    const maxSharesForPrice = Math.min(size, remainingShares);

    if (maxSharesForPrice > 0) {
      // Sell the shares
      totalSharesSold += maxSharesForPrice;
      totalValue += maxSharesForPrice * price;
      remainingShares -= maxSharesForPrice;
    }
  }

  const averagePrice = totalValue / totalSharesSold;

  return {
    totalValue,
    averagePrice,
  };
}

export function buyFunction(data, amountInUSD) {
  if (!data) return { totalShares: 0, averagePrice: 0 };
  if (data?.length === 0) return { totalShares: 0, averagePrice: 0 };
  // Sort data by price in ascending order
  const sortedData = [...data]?.sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price)
  );

  let remainingAmount = amountInUSD;
  let totalShares = 0;
  let totalCost = 0;

  for (const order of sortedData) {
    const price = parseFloat(order.price);
    const size = parseFloat(order.size);

    if (remainingAmount <= 0) {
      break; // Stop if no more amount is left
    }

    // Calculate the maximum number of shares we can buy with the remaining amount
    const maxSharesForPrice = Math.min(size, remainingAmount / price);

    if (maxSharesForPrice > 0) {
      // Buy the shares
      totalShares += maxSharesForPrice;
      totalCost += maxSharesForPrice * price;
      remainingAmount -= maxSharesForPrice * price;
    }
  }

  const averagePrice = totalCost / totalShares;

  return {
    totalShares,
    averagePrice,
  };
}

export const getAccumulativeValue = (arr, length) => {
  if (!Array.isArray(arr)) {
    return 0;
  }
  let arr2 = [...arr];
  let total = 0;
  for (let i = 0; i < length + 1; i++) {
    total += Number(arr2[i]?.[0]) * Number(arr2[i]?.[1]);
  }
  return total;
};

export const getAccumulativeValueReverse = (arr, length) => {
  if (!Array.isArray(arr)) {
    return 0;
  }
  let arr2 = [...arr];
  arr2 = arr2.reverse();
  let total = 0;
  for (let i = 0; i <= length; i++) {
    total += Number(arr2[i]?.[0]) * Number(arr2[i]?.[1]);
  }
  return total;
};

export const PnLFormatted = (pnl) => {
  return pnl >= 0 ? `$${pnl}` : `-$${pnl*-1}`;
};

export const getTimeAgo = (time) => {
  const now = new Date();
  const inputTime = new Date(time);
  const diffInSeconds = Math.floor((now.getTime() - inputTime.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}


