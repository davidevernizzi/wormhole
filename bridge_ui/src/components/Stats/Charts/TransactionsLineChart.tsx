import { ChainId } from "@certusone/wormhole-sdk";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Legend,
} from "recharts";
import {
  CHAINS_BY_ID,
  COLOR_BY_CHAIN_ID,
  getChainShortName,
} from "../../../utils/consts";
import { formatDate, formatTVL } from "./utils";

const TransactionsLineChart = ({
  data,
  selectedChains,
}: {
  data: any[];
  selectedChains: ChainId[];
}) => {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          // tickFormatter={formatTVL}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        {selectedChains.map((chainId) => (
          <Line
            dataKey={`transactionsByChain.${chainId}`}
            name={getChainShortName(chainId)}
            stroke={COLOR_BY_CHAIN_ID[chainId]}
            strokeWidth="4"
            dot={false}
            key={chainId}
          />
        ))}
        <Legend iconType="square" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionsLineChart;
