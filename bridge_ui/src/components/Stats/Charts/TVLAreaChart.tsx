import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatTVL, createCumulativeTVLArray } from "./utils";
import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import { useMemo } from "react";
import { TimeFrame } from "./TimeFrame";
import { makeStyles, Typography } from "@material-ui/core";

// TODO: move this into styles?
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
    const data = payload[0].payload;
    return (
      <div className={classes.tooltipContainer}>
        <Typography className={classes.tooltipTitleText}>TVL</Typography>
        <hr className={classes.tooltipRuler}></hr>
        <Typography className={classes.tooltipValueText}>
          {formatTVL(data.totalTVL)}
        </Typography>
        <Typography className={classes.tooltipValueText}>
          {formatDate(data.date)}
        </Typography>
      </div>
    );
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

const TVLAreaChart = ({
  cumulativeTVL,
  timeFrame,
}: {
  cumulativeTVL: NotionalTVLCumulative;
  timeFrame: TimeFrame;
}) => {
  const cumulativeTVLArray = useMemo(() => {
    return createCumulativeTVLArray(cumulativeTVL, timeFrame);
  }, [cumulativeTVL, timeFrame]);

  return (
    <ResponsiveContainer>
      <AreaChart data={cumulativeTVLArray}>
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
        <defs>
          <linearGradient id="gradient" gradientTransform="rotate(100)">
            <stop offset="0%" stopColor="#FF2B57" />
            <stop offset="100%" stopColor="#5EA1EC" />
          </linearGradient>
        </defs>
        <Area dataKey="totalTVL" fill="url(#gradient)" stroke="#405BBC" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TVLAreaChart;
