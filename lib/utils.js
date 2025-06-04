import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { toFixedDown } from "./roundOf";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function availableBalance (asset) {
  const available = Number(asset?.balance) - Number(asset?.locked)
  return toFixedDown(available, 2);
}