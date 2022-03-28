import { useEffect, useState } from "react";
import axios from "axios";

export interface LockedAsset {
  Symbol: string;
  Name: string;
  Address: string;
  CoinGeckoId: string;
  Amount: number;
  Notional: number;
  TokenPrice: number;
}

export interface LockedAssets {
  [tokenAddress: string]: LockedAsset;
}

export interface ChainsAssets {
  [chainId: string]: LockedAssets;
}

export interface NotionalTVLCumulative {
  DailyLocked: {
    [date: string]: ChainsAssets;
  };
}

const useCumulativeTVL = () => {
  const [cumulativeTVL, setCumulativeTVL] =
    useState<NotionalTVLCumulative | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get<NotionalTVLCumulative>("./tvlcumulative.json")
      .then((response) => {
        if (!cancelled) {
          setCumulativeTVL(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(error);
        }
        console.log(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { cumulativeTVL, error };
};

export default useCumulativeTVL;
