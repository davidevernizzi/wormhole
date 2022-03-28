import {
  AreaChart as Chart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatTVL, parseCumulativeTVL } from "./utils";
import { NotionalTVLCumulative } from "../../../hooks/useCumulativeTVL";
import { useMemo } from "react";
import { TimeFrame, TIME_FRAMES } from "./TimeFrame";
import { Grid, Typography } from "@material-ui/core";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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
            {formatTVL(payload[0].value)}
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

const AreaChart = ({
  cumulativeTVL,
  timeFrame,
}: {
  cumulativeTVL: NotionalTVLCumulative | null;
  timeFrame: string;
}) => {
  const parsedCumulativeTVL = useMemo(() => {
    return cumulativeTVL != null
      ? parseCumulativeTVL(cumulativeTVL, TIME_FRAMES[timeFrame])
      : [];
  }, [cumulativeTVL, timeFrame]);

  return (
    <ResponsiveContainer>
    <Chart data={parsedCumulativeTVL}>
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
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
        dataKey="tvl"
        stroke="#405BBC"
        fill="url(#colorUv)"
      />
    </Chart>
    </ResponsiveContainer>
  );
};

export default AreaChart;
