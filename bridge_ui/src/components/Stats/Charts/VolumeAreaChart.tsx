import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { formatDate, formatTVL } from "./utils";

const VolumeAreaChart = ({ data }: { data: any[] }) => {
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
        {/* <Tooltip content={<CustomTooltip />} /> */}
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
          dataKey="totalValue"
          stroke="#405BBC"
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default VolumeAreaChart;
