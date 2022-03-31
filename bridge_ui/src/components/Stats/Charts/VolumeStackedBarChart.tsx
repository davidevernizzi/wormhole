import { ChainId } from "@certusone/wormhole-sdk";
import { Typography, Grid } from "@material-ui/core";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { CHAINS_BY_ID } from "../../../utils/consts";
import {
  COLOR_BY_CHAIN_ID,
  formatDate,
  formatTVL,
  NotionalTransferredEntry,
} from "./utils";

interface BarData {
  date: Date;
  volumeByChain: {
    [chainId: string]: number;
  };
}

const createBarData = (
  data: NotionalTransferredEntry[],
  selectedChains: ChainId[]
): BarData[] => {
  return data.reduce<BarData[]>((barData, entry) => {
    const barDatum: BarData = {
      date: entry.date,
      volumeByChain: {},
    };
    const totalVolume = Object.entries(entry.valueByChain).reduce(
      (accumVolume, [chainId, volume]) => {
        if (selectedChains.indexOf(+chainId as ChainId) > -1) {
          barDatum.volumeByChain[chainId] = volume;
          return accumVolume + volume;
        }
        return accumVolume;
      },
      0
    );
    Object.keys(barDatum.volumeByChain).forEach((chainId) => {
      if (totalVolume > 0) {
        barDatum.volumeByChain[chainId] /= totalVolume / 100;
      }
    });
    barData.push(barDatum);
    return barData;
  }, []);
};

const CustomTooltip = ({ active, payload, label, chainId }: any) => {
  if (active && payload && payload.length) {
    const chainName = CHAINS_BY_ID[chainId as ChainId]?.name;
    const data = payload.find((data: any) => data.name === chainName);
    if (data === undefined) {
      return null;
    }

    return (
      <div style={{ background: "white" }}>
        <Typography
          style={{
            color: "#21227E",
            fontSize: "24px",
            fontWeight: 500,
            lineHeight: "36px",
          }}
        >
          TVL
        </Typography>
        <hr
          style={{
            width: "182px",
            top: "8px",
            border: "3px solid",
            background: "linear-gradient(90deg, #F44B1B 0%, #EEB430 100%)",
            // fill: "url(#colorUv)",
          }}
        ></hr>
        <Grid container justify="space-between">
          <Typography
            display="inline"
            style={{ color: "#404040", fontSize: "18px", lineHeight: "24px" }}
            align="left"
          >
            {`${data.value.toFixed(2)}%`}
          </Typography>
          <Typography
            display="inline"
            style={{ color: "#404040CC", fontSize: "14px", lineHeight: "18px" }}
            align="right"
          >
            {formatDate(label)}
          </Typography>
        </Grid>
      </div>
    );
  }

  return null;
};

const VolumeStackedBarChart = ({
  data,
  selectedChains,
}: {
  data: NotionalTransferredEntry[];
  selectedChains: ChainId[];
}) => {
  const [hoverChainId, setHoverChainId] = useState<ChainId | null>(null);

  const barData = useMemo(() => {
    return createBarData(data, selectedChains);
  }, [data, selectedChains]);

  return (
    <ResponsiveContainer>
      <BarChart data={barData}>
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(tick) => `${tick}%`}
          ticks={[0, 25, 50, 75, 100]}
          domain={[0, 100]}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={<CustomTooltip chainId={hoverChainId} />}
        />
        {selectedChains.map((chainId) => (
          <Bar
            dataKey={`volumeByChain.${chainId}`}
            name={CHAINS_BY_ID[chainId]?.name}
            fill={COLOR_BY_CHAIN_ID[chainId]}
            strokeWidth="4"
            // dot={false}
            key={chainId}
            stackId="a"
            onMouseOver={() => setHoverChainId(chainId)}
          />
        ))}
        <Legend iconType="square" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeStackedBarChart;
