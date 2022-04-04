import { DurationLike } from "luxon";

export interface TimeFrame {
  interval?: number;
  duration?: DurationLike;
}

export const TIME_FRAMES: { [key: string]: TimeFrame } = {
  "7 days": { duration: { days: 7 } },
  "30 days": { duration: { days: 30 } },
  "3 months": { duration: { months: 3 } },
  "6 months": { duration: { months: 6 }, interval: 30 },
  "1 year": { duration: { years: 1 }, interval: 30 },
  "All time": { interval: 30 },
};
