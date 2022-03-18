import { makeStyles, MenuItem, TextField, Typography } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useCallback, useState } from "react";
import AreaChart from "./AreaChart";

const useStyles = makeStyles((theme) => ({
  flexBox: {
    display: "flex",
    flexDirection: "column",
  },
  toggleButton: {
    textTransform: "none",
  },
}));

// type DisplayBy = "Time" | "Chain";

const TIME_FRAMES = [
  "24 hours",
  "7 days",
  "30 days",
  "3 months",
  "6 months",
  "1 year",
  "All time",
];

const TVLChart = () => {
  const classes = useStyles();

  // const [displayBy, setDisplayBy] = useState<DisplayBy>("Time");
  const [displayBy, setDisplayBy] = useState("Time");
  const [chains, setChains] = useState("All chains");
  const [timeFrame, setTimeFrame] = useState(
    TIME_FRAMES[TIME_FRAMES.length - 1]
  );

  // const tvl = useTvl();
  const handleDisplayByChange = useCallback(
    (event, nextDisplayBy) => {
      if (nextDisplayBy !== null) {
        setDisplayBy(nextDisplayBy);
      }
    },
    [setDisplayBy]
  );

  const handleChainsChange = useCallback(
    (event) => setChains(event.target.value),
    [setChains]
  );

  const handleTimeFrameChange = useCallback(
    (event) => setTimeFrame(event.target.value),
    [setTimeFrame]
  );

  return (
    <div className={classes.flexBox}>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Typography style={{ margin: "10px" }}>Display by</Typography>
        <ToggleButtonGroup
          value={displayBy}
          exclusive
          onChange={handleDisplayByChange}
        >
          <ToggleButton value="Time" className={classes.toggleButton}>
            Time
          </ToggleButton>
          <ToggleButton value="Chain" className={classes.toggleButton}>
            Chain
          </ToggleButton>
        </ToggleButtonGroup>
        <TextField
          select
          variant="outlined"
          value={chains}
          onChange={handleChainsChange}
        >
          {["All chains"].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          variant="outlined"
          value={timeFrame}
          onChange={handleTimeFrameChange}
        >
          {TIME_FRAMES.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <AreaChart />
    </div>
  );
};

export default TVLChart;
