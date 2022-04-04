import { ChainId, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useMemo } from "react";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import {
  CHAINS_BY_ID,
  COLOR_BY_CHAIN_ID,
  getChainShortName,
} from "../../../utils/consts";
import { TimeFrame, TIME_FRAMES } from "./TimeFrame";
import { formatDate, formatTVL, createCumulativeTVLArray } from "./utils";

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
  },
  tooltipRuler: {
    height: "3px",
    // backgroundImage: "linear-gradient(90deg, #F44B1B 0%, #EEB430 100%)",
    backgroundColor: "#374B92",
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

const CustomTooltip = ({ active, payload }: any) => {
  const classes = useStyles();
  if (active && payload && payload.length) {
    if (payload.length === 1) {
      const chainId = CHAIN_ID_SOLANA;
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
              <Typography
                display="inline"
                className={classes.tooltipTitleText}
                style={{ marginLeft: "8px" }}
              >
                {chainShortName}
              </Typography>
            </Grid>
            <hr
              className={classes.tooltipRuler}
              style={{ backgroundColor: COLOR_BY_CHAIN_ID[chainId as ChainId] }}
            ></hr>
            <Typography className={classes.tooltipValueText}>
              {formatTVL(data.value)}
            </Typography>
            <Typography className={classes.tooltipValueText}>
              {formatDate(data.payload.date)}
            </Typography>
          </div>
        );
      }
    } else {
      return (
        <div className={classes.tooltipContainer}>
          <Typography noWrap className={classes.tooltipTitleText}>
            Multiple Chains
          </Typography>
          <Typography className={classes.tooltipValueText}>
            {formatDate(payload[0].payload.date)}
          </Typography>
          <hr className={classes.tooltipRuler}></hr>
          {payload.map((data: any) => {
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: data.stroke,
                  }}
                />
                <Typography
                  display="inline"
                  className={classes.tooltipValueText}
                  style={{ marginLeft: "8px", marginRight: "8px" }}
                >
                  {data.name}
                </Typography>
                <Typography
                  display="inline"
                  className={classes.tooltipValueText}
                  style={{ marginLeft: "auto" }}
                >
                  {formatTVL(data.value)}
                </Typography>
              </div>
            );
          })}
        </div>
      );
    }
  }
  return null;
};

const tickFormatter = (dateMs: number) => {
  return new Date(dateMs).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const tickFormatterDaily = (dateMs: number) => {
  return new Date(dateMs).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TVLLineChart = ({
  cumulativeTVL,
  timeFrame,
  selectedChains,
}: {
  cumulativeTVL: NotionalTVLCumulative;
  timeFrame: TimeFrame;
  selectedChains: ChainId[];
}) => {
  const cumulativeTVLArray = useMemo(() => {
    return createCumulativeTVLArray(cumulativeTVL, timeFrame);
  }, [cumulativeTVL, timeFrame]);

  return (
    <ResponsiveContainer>
      <LineChart data={cumulativeTVLArray}>
        <XAxis
          dataKey="date"
          tickFormatter={
            timeFrame.interval === 30 ? tickFormatter : tickFormatterDaily
          }
          tick={{ fill: "white" }}
          interval={timeFrame.interval}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTVL}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {selectedChains.map((chainId) => (
          <Line
            dataKey={`tvlByChain.${chainId}`}
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

export default TVLLineChart;
