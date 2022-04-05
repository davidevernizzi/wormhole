import { ChainId, CHAIN_ID_ETH } from "@certusone/wormhole-sdk";
import { Button, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { ArrowForward } from "@material-ui/icons";
import { useCallback, useMemo, useState } from "react";
import { NotionalTVL } from "../../../hooks/useTVL";
import {
  ChainInfo,
  CHAINS_BY_ID,
  getChainShortName,
} from "../../../utils/consts";
import { formatTVL } from "./utils";

interface ChainTVL {
  chainInfo: ChainInfo;
  tvl: number;
  tvlRatio: number;
}

const createChainTVLs = (tvl: NotionalTVL) => {
  let maxTVL = 0;
  const chainTVLs = Object.entries(tvl.AllTime)
    .reduce<ChainTVL[]>((accum, [chainId, assets]) => {
      const chainInfo = CHAINS_BY_ID[+chainId as ChainId];
      if (chainInfo !== undefined) {
        const tvl = assets["*"].Notional;
        accum.push({
          chainInfo: chainInfo,
          tvl: tvl,
          tvlRatio: 0,
        });
        maxTVL = Math.max(maxTVL, tvl);
      }
      return accum;
    }, [])
    .sort((a, z) => z.tvl - a.tvl);
  if (maxTVL > 0) {
    chainTVLs.forEach((chainTVL) => {
      chainTVL.tvlRatio = (chainTVL.tvl / maxTVL) * 100;
    });
  }
  return chainTVLs;
};

const TVLBarChart = ({
  tvl,
  onChainSelected,
}: {
  tvl: NotionalTVL;
  onChainSelected: (chainInfo: ChainInfo) => void;
}) => {
  const [mouseOverChainId, setMouseOverChainId] =
    useState<ChainId>(CHAIN_ID_ETH);

  const chainTVLs = useMemo(() => {
    return createChainTVLs(tvl);
  }, [tvl]);

  const handleClick = useCallback(
    (chainInfo: ChainInfo) => {
      onChainSelected(chainInfo);
    },
    [onChainSelected]
  );

  const handleMouseOver = useCallback((chainId: ChainId) => {
    setMouseOverChainId(chainId);
  }, []);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <table style={{ borderSpacing: 16, overflowX: "auto", display: "block" }}>
      {chainTVLs.map((chainTVL) => (
        <tr onMouseOver={() => handleMouseOver(chainTVL.chainInfo.id)}>
          <td style={{ textAlign: "right" }}>
            <Typography noWrap display="inline">
              {getChainShortName(chainTVL.chainInfo.id)}
            </Typography>
          </td>
          <td>
            <img
              src={chainTVL.chainInfo.logo}
              alt={""}
              width={24}
              height={24}
            />
          </td>
          <td width="100%">
            <div
              style={{
                height: 30,
                width: `${chainTVL.tvlRatio}%`,
                backgroundImage:
                  "linear-gradient(90deg, #F44B1B 0%, #EEB430 100%)",
              }}
            ></div>
          </td>
          <td>
            <Typography noWrap display="inline">
              {formatTVL(chainTVL.tvl)}
            </Typography>
          </td>
          <td>
            {isSmall || mouseOverChainId === chainTVL.chainInfo.id ? (
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={() => handleClick(chainTVL.chainInfo)}
                style={{
                  height: 30,
                  textTransform: "none",
                  width: 150,
                  fontSize: 12,
                }}
              >
                View assets
              </Button>
            ) : (
              <div style={{ width: 150 }} />
            )}
          </td>
        </tr>
      ))}
    </table>
  );
};

export default TVLBarChart;
