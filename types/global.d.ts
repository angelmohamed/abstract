declare module '*.png' {
  const value: import('next/image').StaticImageData;
  export default value;
}

declare module 'browser-image-compression';

type OrderBookEntry = {
  fill: string;
  price: string;
  contracts: string;
  total: string;
};

interface MarketType {
  outcomePrices: string;
  clobTokenIds: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}