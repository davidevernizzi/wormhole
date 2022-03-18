import { AreaChart as Chart, Area, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Apr 2021",
    uv: 0,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "May 2021",
    uv: 100,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "June 2021",
    uv: 200,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "July 2021",
    uv: 300,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Aug 2021",
    uv: 400,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Sep 2021",
    uv: 500,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Oct\n2021",
    uv: 600,
    pv: 4300,
    amt: 2100,
  },
];

const AreaChart = () => {
  return (
    <div
      style={
        {
          // width: 1024,
          // height: 768,
          //   background: "rgba(255,255,255,0.05)",
        }
      }
    >
      <Chart
        width={1024}
        height={768}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="name" />
        <YAxis />
        {/* <Tooltip content={<CustomTooltip foo={"hello there"} />} /> */}
        <Tooltip />
        <defs>
          <linearGradient
            id="colorUv"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            rotate="226.4deg"
          >
            <stop offset="0%" stopColor="#FF2B57" stopOpacity={1} />
            <stop offset="102.46%" stopColor="#5EA1EC" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#405BBC"
          fill="url(#colorUv)"
        />
      </Chart>
    </div>
  );
};

export default AreaChart;
