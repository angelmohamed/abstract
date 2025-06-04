import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function availableBalance (asset) {
  const available = Number(asset?.balance) - Number(asset?.locked)
  return available.toFixed(2);
}