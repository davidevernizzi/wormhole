import { ChainId } from "@certusone/wormhole-sdk";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  DataWrapper,
  errorDataWrapper,
  fetchDataWrapper,
  receiveDataWrapper,
} from "../store/helpers";
import { COIN_GECKO_IMAGE_URLS } from "../utils/coinGecko";
import { CHAINS_BY_ID, TVL_URL } from "../utils/consts";

export type TVL = {
  logo?: string;
  symbol?: string;
  name?: string;
  amount: string;
  totalValue?: number;
  quotePrice?: number;
  assetAddress: string;
  originChainId: ChainId;
  originChain: string;
  decimals?: number;
};

// TODO: consoloidate these?
interface LockedAsset {
  Symbol: string;
  Name: string;
  Address: string;
  CoinGeckoId: string;
  Amount: number;
  Notional: number;
  TokenPrice: number;
}

interface LockedAssets {
  [tokenAddress: string]: LockedAsset;
}

interface ChainsAssets {
  [chainId: string]: LockedAssets;
}

export interface NotionalTVL {
  Last24HoursChange: ChainsAssets;
  AllTime: ChainsAssets;
}

const createTVLArray = (notionalTvl: NotionalTVL) => {
  const tvl: TVL[] = [];
  for (const [chainId, chainAssets] of Object.entries(notionalTvl.AllTime)) {
    if (chainId === "*") continue;
    const originChainId = +chainId as ChainId;
    const originChain =
      CHAINS_BY_ID[originChainId]?.name || `Unknown [${chainId}]`;
    for (const [tokenAddress, lockedAsset] of Object.entries(chainAssets)) {
      if (tokenAddress === "*") continue;
      tvl.push({
        logo: COIN_GECKO_IMAGE_URLS[lockedAsset.CoinGeckoId],
        symbol: lockedAsset.Symbol,
        name: lockedAsset.Name,
        amount: lockedAsset.Amount.toString(),
        totalValue: lockedAsset.Notional,
        quotePrice: lockedAsset.TokenPrice,
        assetAddress: tokenAddress,
        originChainId,
        originChain,
      });
    }
  }
  return tvl;
};

export const useTVL = () => {
  const [tvl, setTvl] = useState<DataWrapper<TVL[]>>(fetchDataWrapper());

  useEffect(() => {
    let cancelled = false;
    axios
      .get<NotionalTVL>(/*TVL_URL*/ "./notionaltvl.json")
      .then((response) => {
        if (!cancelled) {
          setTvl(receiveDataWrapper(createTVLArray(response.data)));
        }
      })
      .catch((error) => {
        console.log(error);
        if (!cancelled) {
          setTvl(errorDataWrapper(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return tvl;
};

const useTVLNew = () => {
  const [tvl, setTVL] = useState<NotionalTVL | null>(null);
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false;
    axios
      .get<NotionalTVL>("./notionaltvl.json")
      .then((response) => {
        if (!cancelled) {
          setTVL(response.data);
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

  return { tvl, error }

}

export default useTVLNew;
