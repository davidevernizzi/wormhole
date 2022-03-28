import { ChainId } from "@certusone/wormhole-sdk";
import { Typography } from "@material-ui/core";
import { useMemo } from "react";
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
import { CHAINS_BY_ID } from "../../../utils/consts";

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
      if (chainInfo !== undefined) {
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

const renderCustomizedLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const radius = 10;

  return (
    <g>
      <text
        x={x + width + 10}
        y={y + height / 2}
        fill="#fff"
        textAnchor="right"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
};

const ChainTVLChart = ({ tvl }: { tvl: NotionalTVL | null }) => {
  const parsedTVL = useMemo(() => {
    return tvl != null ? parseTVL(tvl) : [];
  }, [tvl]);

  console.log(parsedTVL);

  return (
    <ResponsiveContainer width="100%" height={768}>
      <BarChart data={parsedTVL} layout="vertical">
        <XAxis hide axisLine={false} tickLine={false} type="number" />
        <YAxis
          dataKey="chainName"
          axisLine={false}
          tickLine={false}
          type="category"
          // width={132} // TODO: set base don longest chainName?
        />
        <defs>
          <linearGradient // TODO: where to put this MF
            id="colorUv"
          >
            <stop offset="0%" stopColor="#F44B1B" stopOpacity={1} />
            <stop offset="100%" stopColor="#EEB430" stopOpacity={1} />
          </linearGradient>
        </defs>

        <Bar dataKey="tvl" barSize={32}>
          {/* {parsedTVL.map((value) => {
            return <Cell key={value.chainName} fill="url(#colorUv)" />;
          })} */}
          <LabelList dataKey="tvl" content={renderCustomizedLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChainTVLChart;
