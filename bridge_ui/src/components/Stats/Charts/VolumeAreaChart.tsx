import { makeStyles, Typography } from "@material-ui/core";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AggregatedNotionalTransferred, formatDate, formatTVL } from "./utils";

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
          {formatDate(data.date)}
        </Typography>
      </div>
    );
  }
  return null;
};

const VolumeAreaChart = ({
  data,
}: {
  data: AggregatedNotionalTransferred[];
}) => {
  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
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
        <Tooltip content={<CustomTooltip />} />
        <defs>
          <linearGradient
            id="colorUv"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            // gradientTransform="rotate(0deg)"
            // rotate="226.4deg" // TODO: not sure this is right?
          >
            <stop offset="0%" stopColor="#FF2B57" stopOpacity={1} />
            <stop offset="102.46%" stopColor="#5EA1EC" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="totalTransferred"
          stroke="#405BBC"
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default VolumeAreaChart;
