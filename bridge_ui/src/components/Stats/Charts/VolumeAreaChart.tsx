import { makeStyles, Typography } from "@material-ui/core";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TimeFrame } from "./TimeFrame";
import { TransferData, formatDate, formatTVL } from "./utils";

const useStyles = makeStyles(() => ({
  tooltipContainer: {
    padding: "16px",
    width: "214px",
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
    backgroundImage: "linear-gradient(90deg, #F44B1B 0%, #EEB430 100%)",
  },
  tooltipValueText: {
    color: "#404040",
    fontSize: "18px",
    fontWeight: 500,
  },
}));

const CustomTooltip = ({ active, payload }: any) => {
  const classes = useStyles();
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={classes.tooltipContainer}>
        <Typography className={classes.tooltipTitleText}>All chains</Typography>
        <hr className={classes.tooltipRuler}></hr>
        <Typography className={classes.tooltipValueText}>
          {formatTVL(data.value)}
        </Typography>
        <Typography className={classes.tooltipValueText}>
          {formatDate(data.payload.date)}
        </Typography>
      </div>
    );
  }
  return null;
};

const VolumeAreaChart = ({
  transferData,
  timeFrame,
}: {
  transferData: TransferData[];
  timeFrame: TimeFrame;
}) => {
  return (
    <ResponsiveContainer height={768}>
      <AreaChart data={transferData}>
        <XAxis
          dataKey="date"
          tickFormatter={timeFrame.tickFormatter}
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
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(100)">
            <stop offset="0%" stopColor="#FF2B57" />
            <stop offset="100%" stopColor="#5EA1EC" />
          </linearGradient>
        </defs>
        <Area
          dataKey="totalTransferred"
          stroke="#405BBC"
          fill="url(#gradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default VolumeAreaChart;
