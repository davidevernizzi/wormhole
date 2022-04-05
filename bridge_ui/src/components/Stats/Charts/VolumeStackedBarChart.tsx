import { ChainId } from "@certusone/wormhole-sdk";
import { Typography, makeStyles, Grid } from "@material-ui/core";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import {
  CHAINS_BY_ID,
  COLOR_BY_CHAIN_ID,
  getChainShortName,
} from "../../../utils/consts";
import { TimeFrame } from "./TimeFrame";
import { formatDate, TransferData, formatTVL } from "./utils";

const useStyles = makeStyles(() => ({
  tooltipContainer: {
    padding: "16px",
    minWidth: "214px",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "4px",
  },
  tooltipTitleText: {
    color: "#21227E",
    fontSize: "24px",
    fontWeight: 500,
    marginLeft: "8px",
  },
  tooltipRuler: {
    height: "3px",
  },
  tooltipValueText: {
    color: "#404040",
    fontSize: "18px",
    fontWeight: 500,
  },
  tooltipIcon: {
    width: "24px",
    height: "24px",
  },
}));

interface BarData {
  date: Date;
  volume: {
    [chainId: string]: number;
  };
  volumePercent: {
    [chainId: string]: number;
  };
}

const createBarData = (
  transferData: TransferData[],
  selectedChains: ChainId[]
) => {
  return transferData.reduce<BarData[]>((barData, transfer) => {
    const data: BarData = {
      date: transfer.date,
      volume: {},
      volumePercent: {},
    };
    const totalVolume = Object.entries(transfer.transferredByChain).reduce(
      (totalVolume, [chainId, volume]) => {
        if (selectedChains.indexOf(+chainId as ChainId) > -1) {
          data.volume[chainId] = volume;
          return totalVolume + volume;
        }
        return totalVolume;
      },
      0
    );
    if (totalVolume > 0) {
      Object.keys(data.volume).forEach((chainId) => {
        data.volumePercent[chainId] =
          (data.volume[chainId] / totalVolume) * 100;
      });
    }
    barData.push(data);
    return barData;
  }, []);
};

const CustomTooltip = ({ active, payload, chainId }: any) => {
  const classes = useStyles();
  if (active && payload && payload.length && chainId) {
    const chainShortName = getChainShortName(chainId);
    const data = payload.find((data: any) => data.name === chainShortName);
    if (data) {
      return (
        <div className={classes.tooltipContainer}>
          <Grid container alignItems="center">
            <img
              className={classes.tooltipIcon}
              src={CHAINS_BY_ID[chainId as ChainId]?.logo}
              alt={chainShortName}
            />
            <Typography display="inline" className={classes.tooltipTitleText}>
              {chainShortName}
            </Typography>
          </Grid>
          <hr
            className={classes.tooltipRuler}
            style={{ backgroundColor: COLOR_BY_CHAIN_ID[chainId as ChainId] }}
          ></hr>
          <Typography
            className={classes.tooltipValueText}
          >{`${data.value.toFixed(1)}%`}</Typography>
          <Typography className={classes.tooltipValueText}>
            {formatTVL(data.payload.volume[chainId])}
          </Typography>
          <Typography className={classes.tooltipValueText}>
            {formatDate(data.payload.date)}
          </Typography>
        </div>
      );
    }
  }
  return null;
};

const VolumeStackedBarChart = ({
  transferData,
  timeFrame,
  selectedChains,
}: {
  transferData: TransferData[];
  timeFrame: TimeFrame;
  selectedChains: ChainId[];
}) => {
  const [hoverChainId, setHoverChainId] = useState<ChainId | null>(null);

  const barData = useMemo(() => {
    return createBarData(transferData, selectedChains);
  }, [transferData, selectedChains]);

  return (
    <ResponsiveContainer height={768}>
      <BarChart data={barData}>
        <XAxis
          dataKey="date"
          tickFormatter={timeFrame.tickFormatter}
          tick={{ fill: "white" }}
          interval={timeFrame.interval}
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
          content={<CustomTooltip chainId={hoverChainId} barData={barData} />}
          cursor={{ fill: "transparent" }}
        />
        {selectedChains.map((chainId) => (
          <Bar
            dataKey={`volumePercent.${chainId}`}
            name={getChainShortName(chainId)}
            fill={COLOR_BY_CHAIN_ID[chainId]}
            key={chainId}
            stackId="a"
            onMouseOver={() => setHoverChainId(chainId)}
            label="foobar"
          />
        ))}
        <Legend iconType="square" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VolumeStackedBarChart;
