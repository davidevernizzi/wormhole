import {
  ChainId,
  CHAIN_ID_ACALA,
  CHAIN_ID_ALGORAND,
  CHAIN_ID_AURORA,
  CHAIN_ID_AVAX,
  CHAIN_ID_BSC,
  CHAIN_ID_ETH,
  CHAIN_ID_FANTOM,
  CHAIN_ID_KARURA,
  CHAIN_ID_OASIS,
  CHAIN_ID_POLYGON,
  CHAIN_ID_SOLANA,
  CHAIN_ID_TERRA,
} from "@certusone/wormhole-sdk";
import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import { TimeFrame } from "./TimeFrame";

// TODO: move elsewhere? more formatting
export const formatTVL = (tvl: number) => {
  return `$${(tvl / 1e9).toFixed(2)} B`;
};

export const formatDate = (date: Date) => {
  return date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
};

export const COLOR_BY_CHAIN_ID: { [key in ChainId]?: string } = {
  [CHAIN_ID_SOLANA]: "#31D7BB",
  [CHAIN_ID_ETH]: "#8A92B2",
  [CHAIN_ID_TERRA]: "#5493F7",
  [CHAIN_ID_BSC]: "#F0B90B",
  [CHAIN_ID_POLYGON]: "#8247E5",
  [CHAIN_ID_AVAX]: "#E84142",
  [CHAIN_ID_OASIS]: "#0092F6",
  [CHAIN_ID_ALGORAND]: "#000000",
  [CHAIN_ID_AURORA]: "#23685A",
  [CHAIN_ID_FANTOM]: "#1969FF",
  [CHAIN_ID_KARURA]: "#FF4B3B",
  [CHAIN_ID_ACALA]: "##E00F51",
};

export interface ParsedCumulativeTVL {
  date: Date; // TODO: date migghat be misnomer?
  tvl: number;
  tvlByChain: {
    [chainId: string]: number;
  };
}

export const parseCumulativeTVL = (
  notionalTVLCumulative: NotionalTVLCumulative,
  timeFrame: TimeFrame
): ParsedCumulativeTVL[] => {
  return Object.entries(notionalTVLCumulative.DailyLocked)
    .reduce<ParsedCumulativeTVL[]>((accum, [date, chains]) => {
      const intervalDate = new Date(
        timeFrame.interval === "Monthly" ? date.slice(0, 7) : date
      );
      let entry = accum[accum.length - 1];
      if (
        entry === undefined ||
        entry.date.getTime() !== intervalDate.getTime()
      ) {
        entry = {
          date: intervalDate,
          tvl: 0,
          tvlByChain: {},
        };
        accum.push(entry);
      }
      // TODO: chain 56 and 0 are bad
      Object.entries(chains).forEach(([chainId, lockedAssets]) => {
        const notional = lockedAssets["*"].Notional;
        if (chainId === "*") {
          entry.tvl = notional;
        } else {
          entry.tvlByChain[chainId] = notional;
        }
      });
      return accum;
    }, [])
    .slice(timeFrame.count ? -timeFrame.count : undefined);
};
