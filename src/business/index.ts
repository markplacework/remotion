import burgerHouseData from "./burger-house.json";
import { BusinessData } from "./types";

// Registry of businesses this project can generate a video for. To add a
// new business: drop its assets in public/business/<slug>/, add a
// <slug>.json here following the same shape, and register it below.
export const BUSINESSES: Record<string, BusinessData> = {
  "burger-house": burgerHouseData,
};

export const ACTIVE_BUSINESS: BusinessData = BUSINESSES["burger-house"];

export * from "./types";
