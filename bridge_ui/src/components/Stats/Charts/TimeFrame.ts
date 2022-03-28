export interface TimeFrame {
  interval: "Daily" | "Monthly";
  count: number | undefined;
}

export const TIME_FRAMES: { [key: string]: TimeFrame } = {
  // "24 hours", // TODO: need to support hourly data
  "7 days": { interval: "Daily", count: 7 },
  "30 days": { interval: "Daily", count: 30 },
  "3 months": { interval: "Monthly", count: 3 },
  "6 months": { interval: "Monthly", count: 6 },
  "1 year": { interval: "Monthly", count: 12 },
  "All time": { interval: "Monthly", count: undefined },
};
