import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import { NotionalTransferred } from "../../../hooks/useNotionalTransferred";
import { TransactionCount } from "../../../hooks/useTransactionCount";
import { TimeFrame } from "./TimeFrame";
import { DateTime } from "luxon";

export const formatTVL = (tvl: number) => {
  const [divisor, unit, fractionDigits] =
    tvl < 1e3
      ? [1, "", 0]
      : tvl < 1e6
      ? [1e3, "K", 0]
      : tvl < 1e9
      ? [1e6, "M", 0]
      : [1e9, "B", 2];
  return `$${(tvl / divisor).toFixed(fractionDigits)} ${unit}`;
};

export const formatDate = (date: Date) => {
  // TODO: this should be toLocalteDateString...
  // why is object passed in and number and string???
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export interface CumulativeTVLEntry {
  date: Date;
  totalTVL: number;
  tvlByChain: {
    [chainId: string]: number;
  };
}

export const createCumulativeTVLArray = (
  notionalTVLCumulative: NotionalTVLCumulative,
  timeFrame: TimeFrame
): CumulativeTVLEntry[] => {
  const startDate = timeFrame.duration
    ? DateTime.now().minus(timeFrame.duration).toJSDate()
    : undefined;
  return Object.entries(notionalTVLCumulative.DailyLocked)
    .reduce<CumulativeTVLEntry[]>(
      (cumulativeTVLArray, [dateString, chainsAssets]) => {
        const date = new Date(dateString);
        if (!startDate || date >= startDate) {
          const entry: CumulativeTVLEntry = {
            date: date,
            totalTVL: 0,
            tvlByChain: {},
          };
          // TODO: chain 56 and 0 are bad
          Object.entries(chainsAssets).forEach(([chainId, lockedAssets]) => {
            const notional = lockedAssets["*"].Notional;
            if (chainId === "*") {
              entry.totalTVL = notional;
            } else {
              entry.tvlByChain[chainId] = notional;
            }
          });
          cumulativeTVLArray.push(entry);
        }
        return cumulativeTVLArray;
      },
      []
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export interface AggregatedNotionalTransferred {
  date: Date;
  totalTransferred: number;
  transferredByChain: {
    [chainId: string]: number;
  };
}

export const aggregateNotionalTransferred = (
  notionalTransferred: NotionalTransferred,
  timeFrame: TimeFrame
) => {
  /*
  const sortedDates = Object.keys(notionalTransferred.Daily).sort();
  return sortedDates
    .reduce<AggregatedNotionalTransferred[]>((data, date) => {
      const transferData = notionalTransferred.Daily[date];
      const dateKey = new Date(
        timeFrame.interval === "Monthly" ? date.slice(0, 7) : date
      );
      let entry = data[data.length - 1];
      if (entry === undefined || entry.date.getTime() !== dateKey.getTime()) {
        entry = {
          date: dateKey,
          totalTransferred: 0,
          transferredByChain: {},
        };
        data.push(entry);
      }
      // TODO: chain 56 and 0 are bad
      Object.entries(transferData).forEach(([chainId, lockedAssets]) => {
        const value = lockedAssets["*"]["*"];
        if (chainId === "*") {
          entry.totalTransferred += value;
        } else {
          entry.transferredByChain[chainId] =
            (entry.transferredByChain[chainId] || 0) + value;
        }
      });
      return data;
    }, [])
    .slice(timeFrame.count ? -timeFrame.count : 0);
    */
  return [];
};

export interface AggregatedTransactions {
  date: Date;
  totalTransactions: number;
  transactionsByChain: {
    [chainId: string]: number;
  };
}

export const aggregateTransactions = (
  transactionCount: TransactionCount,
  timeFrame: TimeFrame
) => {
  /*
  const sortedDates = Object.keys(transactionCount.dailyTotals).sort();
  return sortedDates
    .reduce<AggregatedTransactions[]>((data, date) => {
      const transferData = transactionCount.dailyTotals[date];
      const dateKey = new Date(
        timeFrame.interval === "Monthly" ? date.slice(0, 7) : date
      );
      let entry = data[data.length - 1];
      if (entry === undefined || entry.date.getTime() !== dateKey.getTime()) {
        entry = {
          date: dateKey,
          totalTransactions: 0,
          transactionsByChain: {},
        };
        data.push(entry);
      }
      // TODO: chain 56 and 0 are bad
      Object.entries(transferData).forEach(([chainId, count]) => {
        console.log(chainId);
        if (chainId === "*") {
          entry.totalTransactions += count;
        } else {
          entry.transactionsByChain[chainId] =
            (entry.transactionsByChain[chainId] || 0) + count;
        }
      });
      return data;
    }, [])
    .slice(timeFrame.count ? -timeFrame.count : 0);
    */
  return [];
};
