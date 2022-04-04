import { ChainId } from "@certusone/wormhole-sdk";
import {
  Checkbox,
  FormControl,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useCallback, useMemo, useState } from "react";
import useNotionalTransferred, {
  NotionalTransferred,
} from "../../hooks/useNotionalTransferred";
import { COLORS } from "../../muiTheme";
import { CHAINS_BY_ID } from "../../utils/consts";
import { TIME_FRAMES } from "./Charts/TimeFrame";
import {
  aggregateNotionalTransferred,
  aggregateTransactions,
} from "./Charts/utils";
import VolumeAreaChart from "./Charts/VolumeAreaChart";
import VolumeStackedBarChart from "./Charts/VolumeStackedBarChart";
import VolumeLineChart from "./Charts/VolumeLineChart";
import useTransactionCount from "../../hooks/useTransactionCount";
import TransactionsAreaChart from "./Charts/TransactionsAreaChart ";
import TransactionsLineChart from "./Charts/TransactionsLineChart";

const DISPLAY_BY_VALUES = ["Dollar", "Percent", "Transactions"];

const useStyles = makeStyles((theme) => ({
  description: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  displayBy: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "16px",
  },
  mainPaper: {
    backgroundColor: COLORS.whiteWithTransparency,
    padding: "2rem",
    marginBottom: theme.spacing(8),
    height: "768px",
  },
  toggleButton: {
    textTransform: "none",
  },
  tooltip: {
    marginLeft: "8px",
    marginBottom: "16px",
  },
}));

const VolumeStats = () => {
  const classes = useStyles();

  const [displayBy, setDisplayBy] = useState(DISPLAY_BY_VALUES[0]);
  const [timeFrame, setTimeFrame] = useState("All time");

  const [selectedChains, setSelectedChains] = useState<ChainId[]>([]);

  const notionalTransferred = useNotionalTransferred();

  const aggregatedNotionalTransferred = useMemo(() => {
    return notionalTransferred.data
      ? aggregateNotionalTransferred(
          notionalTransferred.data,
          TIME_FRAMES[timeFrame]
        )
      : [];
  }, [notionalTransferred, timeFrame]);

  const transactions = useTransactionCount();

  const aggregatedTransactions = useMemo(() => {
    return transactions.data
      ? aggregateTransactions(transactions.data, TIME_FRAMES[timeFrame])
      : [];
  }, [transactions, timeFrame]);

  const availableChains = useMemo(() => {
    const chainIds = notionalTransferred.data
      ? Object.keys(
          Object.values(notionalTransferred.data.Daily)[0] || {}
        ).reduce<ChainId[]>((accum, key) => {
          const chainId = parseInt(key) as ChainId;
          if (CHAINS_BY_ID[chainId] !== undefined) {
            accum.push(chainId);
          }
          return accum;
        }, [])
      : [];
    setSelectedChains(chainIds);
    return chainIds;
  }, [notionalTransferred]);

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

  const allChainsSelected = selectedChains.length === availableChains.length;

  return (
    <>
      <div className={classes.description}>
        <Typography display="inline" variant="h3">
          Outbound Volume
          <Tooltip
            title="Amount of assets bridged through the Wormhole in the outbound direction"
            arrow
            className={classes.tooltip}
          >
            <InfoOutlined />
          </Tooltip>
        </Typography>
        <Typography
          display="inline"
          style={{ marginLeft: "auto", marginRight: "8px" }}
        >
          at this time
        </Typography>
        <Typography display="inline" variant="h3">
          {"$3,299,299,299"}
        </Typography>
      </div>
      <div className={classes.displayBy}>
        <Typography style={{ marginRight: "8px" }}>Display by</Typography>
        <ToggleButtonGroup
          value={displayBy}
          exclusive
          onChange={handleDisplayByChange}
        >
          {DISPLAY_BY_VALUES.map((value) => (
            <ToggleButton
              key={value}
              value={value}
              className={classes.toggleButton}
            >
              {value}
            </ToggleButton>
          ))}
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
                checked={availableChains.length > 0 && allChainsSelected}
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
        {displayBy === "Dollar" ? (
          allChainsSelected ? (
            <VolumeAreaChart data={aggregatedNotionalTransferred} />
          ) : (
            <VolumeLineChart
              data={aggregatedNotionalTransferred}
              selectedChains={selectedChains}
            />
          )
        ) : displayBy === "Percent" ? (
          <VolumeStackedBarChart
            notionalTransferred={aggregatedNotionalTransferred}
            selectedChains={selectedChains}
          />
        ) : allChainsSelected ? (
          <TransactionsAreaChart data={aggregatedTransactions} />
        ) : (
          <TransactionsLineChart
            data={aggregatedTransactions}
            selectedChains={selectedChains}
          />
        )}
      </Paper>
    </>
  );
};

export default VolumeStats;
