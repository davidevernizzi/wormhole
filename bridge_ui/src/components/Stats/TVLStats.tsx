import {
  Checkbox,
  FormControl,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useCallback, useMemo, useState } from "react";
import TVLAreaChart from "./Charts/TVLAreaChart";
import useCumulativeTVL from "../../hooks/useCumulativeTVL";
import { TIME_FRAMES } from "./Charts/TimeFrame";
import TVLLineChart from "./Charts/TVLLineChart";
import { CHAINS_BY_ID } from "../../utils/consts";
import { ChainId } from "@certusone/wormhole-sdk";
import { COLORS } from "../../muiTheme";
import ChainTVLChart from "./Charts/ChainTVLChart";
import useTVLNew from "../../hooks/useTVL";

const useStyles = makeStyles((theme) => ({
  flexBox: {
    display: "flex",
    flexDirection: "column",
  },
  mainPaper: {
    backgroundColor: COLORS.whiteWithTransparency,
    padding: "2rem",
    "& > h, & > p ": {
      margin: ".5rem",
    },
    marginBottom: theme.spacing(8),
    // width: "100%",
    height: "768px",
  },
  toggleButton: {
    textTransform: "none",
  },
}));

const TVLStats = () => {
  const classes = useStyles();

  const [displayBy, setDisplayBy] = useState("Time");
  const [timeFrame, setTimeFrame] = useState("All time");

  const [selectedChains, setSelectedChains] = useState<ChainId[]>([]);

  // TODO: should probably pass this in
  const { cumulativeTVL } = useCumulativeTVL();
  const { tvl } = useTVLNew();

  const availableChains = useMemo(() => {
    const chainIds = cumulativeTVL
      ? Object.keys(Object.values(cumulativeTVL.DailyLocked)[0])
          .reduce<ChainId[]>((accum, key) => {
            const chainId = parseFloat(key) as ChainId;
            if (CHAINS_BY_ID[chainId] !== undefined) {
              accum.push(chainId);
            }
            return accum;
          }, [])
          .sort()
      : [];
    setSelectedChains(chainIds);
    return chainIds;
  }, [cumulativeTVL]);

  const handleDisplayByChange = useCallback((event, nextValue) => {
    if (nextValue !== null) {
      setDisplayBy(nextValue);
    }
  }, []);

  const handleTimeFrameChange = useCallback(
    (event) => setTimeFrame(event.target.value),
    []
  );

  const handleSelectedChainsChange = useCallback(
    (event) => {
      const value = event.target.value;
      if (value[value.length - 1] === "all") {
        setSelectedChains((prevValue) =>
          prevValue.length === availableChains.length ? [] : availableChains
        );
      } else {
        setSelectedChains(value);
      }
    },
    [availableChains]
  );

  return (
    <div className={classes.flexBox}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <Typography style={{ marginRight: "6px" }}>Display by</Typography>
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
        <FormControl style={{ marginLeft: "auto", marginRight: "16px" }}>
          <Select
            multiple
            variant="outlined"
            value={selectedChains}
            onChange={handleSelectedChainsChange}
            renderValue={(selected: any) =>
              selected.length === availableChains.length
                ? "All chains"
                : selected.length > 1
                ? `${selected.length} chains`
                : //@ts-ignore
                  CHAINS_BY_ID[selected[0]]?.name
            }
          >
            <MenuItem value="all">
              <Checkbox
                checked={
                  availableChains.length > 0 &&
                  selectedChains.length === availableChains.length
                }
                indeterminate={
                  selectedChains.length > 0 &&
                  selectedChains.length < availableChains.length
                }
              />
              <ListItemText primary="All chains" />
            </MenuItem>
            {availableChains.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={selectedChains.indexOf(option) > -1} />
                <ListItemText primary={CHAINS_BY_ID[option]?.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          select
          variant="outlined"
          value={timeFrame}
          onChange={handleTimeFrameChange}
        >
          {Object.keys(TIME_FRAMES).map((timeFrame /* TODO: memoize ? */) => (
            <MenuItem key={timeFrame} value={timeFrame}>
              {timeFrame}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <Paper className={classes.mainPaper}>
        {displayBy === "Time" ? (
          selectedChains.length === availableChains.length ? (
            <TVLAreaChart cumulativeTVL={cumulativeTVL} timeFrame={timeFrame} />
          ) : (
            <TVLLineChart
              cumulativeTVL={cumulativeTVL}
              timeFrame={timeFrame}
              selectedChains={selectedChains}
            />
          )
        ) : (
          <ChainTVLChart tvl={tvl} />
        )}
      </Paper>
    </div>
  );
};

export default TVLStats;
