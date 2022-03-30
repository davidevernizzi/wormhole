import { ChainId } from "@certusone/wormhole-sdk";
import { useMemo } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import { CHAINS_BY_ID } from "../../../utils/consts";
import { TIME_FRAMES } from "./TimeFrame";
import {
  COLOR_BY_CHAIN_ID,
  formatDate,
  formatTVL,
  parseCumulativeTVL,
} from "./utils";

const TVLLineChart = ({
  cumulativeTVL,
  timeFrame,
  selectedChains,
}: {
  cumulativeTVL: NotionalTVLCumulative | null;
  timeFrame: string;

  selectedChains: ChainId[];
}) => {
  const parsedCumulativeTVL = useMemo(() => {
    return cumulativeTVL != null
      ? parseCumulativeTVL(cumulativeTVL, TIME_FRAMES[timeFrame])
      : [];
  }, [cumulativeTVL, timeFrame]);

  return (
    <ResponsiveContainer>
      <LineChart data={parsedCumulativeTVL}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTVL}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        {selectedChains.map((chainId) => (
          <Line
            dataKey={`tvlByChain.${chainId}`}
            name={CHAINS_BY_ID[chainId]?.name}
            stroke={COLOR_BY_CHAIN_ID[chainId]}
            strokeWidth="4"
            dot={false}
            key={chainId}
          />
        ))}
        <Legend iconType="square"/>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TVLLineChart;
