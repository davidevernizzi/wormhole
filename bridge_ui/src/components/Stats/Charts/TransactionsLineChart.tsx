import { ChainId } from "@certusone/wormhole-sdk";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Legend,
  Tooltip,
} from "recharts";
import {
  CHAINS_BY_ID,
  COLOR_BY_CHAIN_ID,
  getChainShortName,
} from "../../../utils/consts";
import { TimeFrame } from "./TimeFrame";
import { formatDate, formatTransactionCount, TransactionData } from "./utils";

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
      const chainId = +payload[0].dataKey.split(".")[1] as ChainId;
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
              {`${formatTransactionCount(data.value)} transactions`}
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
                  {`${formatTransactionCount(data.value)} transactions`}
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

const TransactionsLineChart = ({
  transactionData,
  timeFrame,
  chains,
}: {
  transactionData: TransactionData[];
  timeFrame: TimeFrame;
  chains: ChainId[];
}) => {
  return (
    <ResponsiveContainer height={768}>
      <LineChart data={transactionData}>
        <XAxis
          dataKey="date"
          tickFormatter={timeFrame.tickFormatter}
          tick={{ fill: "white" }}
          interval={timeFrame.interval}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTransactionCount}
          tick={{ fill: "white" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {chains.map((chainId) => (
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
