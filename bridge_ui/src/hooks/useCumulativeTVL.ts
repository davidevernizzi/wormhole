import { useEffect, useState } from "react";
import axios from "axios";
import {
  DataWrapper,
  errorDataWrapper,
  fetchDataWrapper,
  receiveDataWrapper,
} from "../store/helpers";

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
  const [cumulativeTVL, setCumulativeTVL] = useState<
    DataWrapper<NotionalTVLCumulative>
  >(fetchDataWrapper());

  useEffect(() => {
    let cancelled = false;
    axios
      .get<NotionalTVLCumulative>("./tvlcumulative.json")
      .then((response) => {
        if (!cancelled) {
          setCumulativeTVL(receiveDataWrapper(response.data));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setCumulativeTVL(errorDataWrapper(error));
        }
        console.log(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return cumulativeTVL;
};

export default useCumulativeTVL;
