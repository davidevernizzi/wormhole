import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import { NotionalTransferred } from "../../../hooks/useNotionalTransferred";
import { TimeFrame } from "./TimeFrame";
import { DateTime } from "luxon";
import { Totals } from "../../../hooks/useTransactionTotals";
import { VAA_EMITTER_ADDRESSES } from "../../../utils/consts";

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
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatTickDay = (date: Date | number) => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatTickMonth = (date: Date | number) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export const formatTransactionCount = (transactionCount: number) => {
  return transactionCount.toLocaleString("en-US");
};

const getStartDate = (timeFrame: TimeFrame) => {
  return timeFrame.duration
    ? DateTime.now().minus(timeFrame.duration).toJSDate()
    : undefined;
};

export interface CumulativeTVLData {
  date: Date;
  totalTVL: number;
  tvlByChain: {
    [chainId: string]: number;
  };
}

export const createCumulativeTVLData = (
  cumulativeTVL: NotionalTVLCumulative,
  timeFrame: TimeFrame
): CumulativeTVLData[] => {
  const startDate = getStartDate(timeFrame);
  return Object.entries(cumulativeTVL.DailyLocked)
    .reduce<CumulativeTVLData[]>(
      (cumulativeTVLArray, [dateString, chainsAssets]) => {
        const date = new Date(dateString);
        if (!startDate || date >= startDate) {
          const data: CumulativeTVLData = {
            date: date,
            totalTVL: 0,
            tvlByChain: {},
          };
          Object.entries(chainsAssets).forEach(([chainId, lockedAssets]) => {
            const notional = lockedAssets["*"].Notional;
            if (chainId === "*") {
              data.totalTVL = notional;
            } else {
              data.tvlByChain[chainId] = notional;
            }
          });
          cumulativeTVLArray.push(data);
        }
        return cumulativeTVLArray;
      },
      []
    )
    .sort((a, z) => a.date.getTime() - z.date.getTime());
};

export interface TransferData {
  date: Date;
  totalTransferred: number;
  transferredByChain: {
    [chainId: string]: number;
  };
}

export const createCumulativeTransferData = (
  notionalTransferred: NotionalTransferred,
  timeFrame: TimeFrame
) => {
  const startDate = getStartDate(timeFrame);
  const sortedDates = Object.keys(notionalTransferred.Daily).sort();
  return sortedDates
    .reduce<TransferData[]>((transferData, date) => {
      const bidirectionalTransferData = notionalTransferred.Daily[date];
      const data: TransferData = {
        date: new Date(date),
        totalTransferred: 0,
        transferredByChain: {},
      };
      Object.entries(bidirectionalTransferData).forEach(
        ([chainId, lockedAssets]) => {
          const value = lockedAssets["*"]["*"];
          if (chainId === "*") {
            data.totalTransferred =
              value +
              (transferData[transferData.length - 1]?.totalTransferred || 0);
          } else {
            data.transferredByChain[chainId] =
              value +
              (transferData[transferData.length - 1]?.transferredByChain[
                chainId
              ] || 0);
          }
        }
      );
      transferData.push(data);
      return transferData;
    }, [])
    .filter((data) => !startDate || startDate <= data.date);
};

export interface TransactionData {
  date: Date;
  totalTransactions: number;
  transactionsByChain: {
    [chainId: string]: number;
  };
}

export const createCumulativeTransactionData = (
  totals: Totals,
  timeFrame: TimeFrame
) => {
  const startDate = getStartDate(timeFrame);
  const sortedDates = Object.keys(totals.DailyTotals).sort();
  return sortedDates
    .reduce<TransactionData[]>((transactionData, date) => {
      const groupByKeys = totals.DailyTotals[date];
      const prevData = transactionData[transactionData.length - 1];
      const data: TransactionData = {
        date: new Date(date),
        totalTransactions: prevData?.totalTransactions || 0,
        transactionsByChain: prevData?.transactionsByChain || {},
      };
      VAA_EMITTER_ADDRESSES.forEach((address) => {
        const chainId = address.slice(0, address.indexOf(":"));
        const count = groupByKeys[address] || 0;
        data.transactionsByChain[chainId] =
          (data.transactionsByChain[chainId] || 0) + count;
        data.totalTransactions += count;
      });
      transactionData.push(data);
      return transactionData;
    }, [])
    .filter((data) => !startDate || startDate <= data.date);
};
