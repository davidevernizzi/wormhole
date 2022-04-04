import { ChainId, CHAIN_ID_BSC } from "@certusone/wormhole-sdk";
import { Button, Typography } from "@material-ui/core";
import { ArrowForward } from "@material-ui/icons";
import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { NotionalTVL } from "../../../hooks/useTVL";
import { ChainInfo, CHAINS, CHAINS_BY_ID } from "../../../utils/consts";
import { formatTVL } from "./utils";

interface ParsedTVL {
  chainName: string;
  tvl: number;
  logo: string;
}

const parseTVL = (tvl: NotionalTVL) => {
  return Object.entries(tvl.AllTime)
    .reduce<ParsedTVL[]>((accum, [chainId, assets]) => {
      // TODO: show unknown chain??
      const chainInfo = CHAINS_BY_ID[+chainId as ChainId];
      if (chainInfo !== undefined /*&& chainInfo.name.includes("Eth")*/) {
        accum.push({
          chainName: chainInfo.name,
          tvl: assets["*"].Notional,
          logo: chainInfo.logo,
        });
      }
      return accum;
    }, [])
    .sort((a, b) => b.tvl - a.tvl);
};

const CustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;

  return (
    <g>
      <text
        // x={x + width + 1000}
        // y={y - 20}
        x={x + width + 5}
        y={y + 16}
        fill="#fff"
        textAnchor="right"
        dominantBaseline="middle"
      >
        {formatTVL(value)}
      </text>
    </g>
  );
};

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const chainInfo = CHAINS.find((chain) => chain.name === payload.value);
  const chainDisplayName =
    chainInfo?.id === CHAIN_ID_BSC ? "BSC" : chainInfo?.name;
  // return <Typography style={{ color: "white" }}>{payload.value}</Typography>;

  const handleClick = useCallback(() => {
    if (chainInfo) props.onClick(chainInfo);
  }, [chainInfo, props]);

  return (
    // <g x={x} y={y} width={128} height={24}>
    <foreignObject width="110" height="32" y={y -14}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* <text style={{ whiteSpace: "nowrap" }}> */}
        <text style={{marginLeft: "auto"}}>{chainDisplayName}</text>
        <img
          src={chainInfo?.logo}
          alt={chainDisplayName}
          width="24px"
          height="24px"
          style={{ whiteSpace: "nowrap", marginLeft: "8px" }}
        />
      </div>
    </foreignObject>
    // </g>
  );

  /* TODO: mobile 
  return (
    <foreignObject
      x={x - 14}
      y={y - 50}
      width={1} // TODO: how to set this?
      height={1}
      overflow="visible"
      // xmlns="http://www.w3.org/1999/xhtml"
    >
      <div
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={handleClick}
      >
        <img
          src={chainInfo?.logo}
          alt={chainDisplayName}
          width="24px"
          height="24px"
        />
        <text
          style={{ whiteSpace: "nowrap", marginLeft: "5px" }}
        >{`${chainDisplayName} assets`}</text>
        <ArrowForward />
      </div>
    </foreignObject>
  );
  */
};

const ChainTVLChart = ({
  tvl,
  onChainSelected,
}: {
  tvl: NotionalTVL | null;
  onChainSelected: (chainInfo: ChainInfo) => void;
}) => {
  const parsedTVL = useMemo(() => {
    return tvl != null ? parseTVL(tvl) : [];
  }, [tvl]);

  const handleChainSelected = useCallback(
    (chainInfo: ChainInfo) => {
      onChainSelected(chainInfo);
    },
    [onChainSelected]
  );

  return (
    <ResponsiveContainer>
      <BarChart data={parsedTVL} layout="vertical" margin={{ right: 40 }}>
        <XAxis hide axisLine={false} tickLine={false} type="number" />
        <YAxis
          // tickMargin={-20}
          // tick={{ fill: "white", textAnchor: "middle" }}
          tick={<CustomYAxisTick onClick={handleChainSelected} />}
          dataKey="chainName"
          axisLine={false}
          tickLine={false}
          type="category"
          width={120}
        />
        <defs>
          <linearGradient // TODO: where to put this MF
            id="colorUv"
          >
            <stop offset="0%" stopColor="#F44B1B" stopOpacity={1} />
            <stop offset="100%" stopColor="#EEB430" stopOpacity={1} />
          </linearGradient>
        </defs>

        <Bar
          dataKey="tvl"
          barSize={32}
          fill="url(#colorUv)"
          // label={{formatter:(value: any) => formatTVL(value), position: "end"}}
        >
          <LabelList
            dataKey="totalTVL"
            content={<CustomizedLabel />}
            fill="white"
            position="right"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChainTVLChart;
