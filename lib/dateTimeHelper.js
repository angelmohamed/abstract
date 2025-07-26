export const getTimeframeDate = (timeframe = "all") => {
    const now = new Date();
  
    switch (timeframe) {
      case "1h":
        return new Date(now.getTime() - 1 * 60 * 60 * 1000);
      case "6h":
        return new Date(now.getTime() - 6 * 60 * 60 * 1000);
      case "1d":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "1w":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "1m":
        return new Date(new Date().setMonth(now.getMonth() - 1));
      case "6m":
        return new Date(new Date().setMonth(now.getMonth() - 6));
      case "1y":
        return new Date(new Date().setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
};
  