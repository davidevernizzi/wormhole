import { ChainId } from "@certusone/wormhole-sdk";
import { useMemo } from "react";
import {
  Line,
  LineChart as Chart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
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
      <Chart width={1024} height={768} data={parsedCumulativeTVL}>
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
            stroke={COLOR_BY_CHAIN_ID[chainId]}
            strokeWidth="4"
            dot={false}
            key={chainId}
          />
        ))}
      </Chart>
    </ResponsiveContainer>
  );
};

export default TVLLineChart;
