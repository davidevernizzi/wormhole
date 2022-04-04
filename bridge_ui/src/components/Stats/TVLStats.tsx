import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useCallback, useMemo, useState } from "react";
import TVLAreaChart from "./Charts/TVLAreaChart";
import useCumulativeTVL from "../../hooks/useCumulativeTVL";
import { TIME_FRAMES } from "./Charts/TimeFrame";
import TVLLineChart from "./Charts/TVLLineChart";
import { ChainInfo, CHAINS_BY_ID } from "../../utils/consts";
import { ChainId } from "@certusone/wormhole-sdk";
import { COLORS } from "../../muiTheme";
import ChainTVLChart from "./Charts/ChainTVLChart";
import ChainTVLTable from "./Charts/ChainTVLTable";
import useTVLNew from "../../hooks/useTVL";
import { ArrowBack, InfoOutlined } from "@material-ui/icons";

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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    // padding: "8px",
    // borderRadius: "4px",
  },
  tvlText: {
    // styleName: "Heading 36",
    // fontFamily: "Poppins",
    // fontSize: "36px",
    // fontStyle: "normal",
    // fontWeight: 400,
    // lineHeight: "42px",
    // letterSpacing: "0em",
    // textAlign: "left",
  },
}));

const tooltipStyles = {
  tooltip: {
    minWidth: "max-content",
    // textAlign: "center",
    borderRadius: "4px",
    backgroundColor: "#5EA1EC",
    color: "#0F0C48",
    fontSize: "14px",
    // "& > *": {
    // margin: ".25rem",
    // },
  },
};

//@ts-ignore
const StyledTooltip = withStyles(tooltipStyles)(Tooltip);

const DISPLAY_BY_VALUES = ["Time", "Chain"];

const TVLStats = () => {
  const classes = useStyles();

  const [displayBy, setDisplayBy] = useState(DISPLAY_BY_VALUES[0]);
  const [timeFrame, setTimeFrame] = useState("All time");

  const [selectedChains, setSelectedChains] = useState<ChainId[]>([]);

  const [selectedChainDetail, setSelectedChainDetail] =
    useState<ChainInfo | null>(null);

  // TODO: should probably pass this in
  const cumulativeTVL = useCumulativeTVL();
  const { tvl } = useTVLNew();

  // TODO: placeholder number until I figure out why tvl numbers don't match (all time and cumulative today)
  const allTimeTVL = useMemo(() => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    return formatter.format(
      (selectedChainDetail
        ? tvl?.AllTime[selectedChainDetail.id]["*"].Notional
        : tvl?.AllTime["*"]["*"].Notional) || 0
    );
  }, [selectedChainDetail, tvl]);

  const availableChains = useMemo(() => {
    const chainIds = cumulativeTVL.data
      ? Object.keys(
          Object.values(cumulativeTVL.data.DailyLocked)[0] || {}
        ).reduce<ChainId[]>((chainIds, key) => {
          const chainId = parseInt(key) as ChainId;
          if (CHAINS_BY_ID[chainId]) {
            chainIds.push(chainId);
          }
          return chainIds;
        }, [])
      : [];
    setSelectedChains(chainIds);
    return chainIds;
  }, [cumulativeTVL]);

  const handleDisplayByChange = useCallback((event, nextValue) => {
    if (nextValue) {
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

  const handleChainDetailSelected = useCallback((chainInfo: ChainInfo) => {
    setSelectedChainDetail(chainInfo);
  }, []);

  const allChainsSelected = selectedChains.length === availableChains.length;
  const tvlText =
    "Total Value Locked" +
    (selectedChainDetail ? ` on ${selectedChainDetail?.name}` : "");
  const tooltipText = selectedChainDetail
    ? `Total Value Locked on ${selectedChainDetail?.name}`
    : "USD equivalent value of all assets locked in the Wormhole protocol";

  return (
    <>
      <div className={classes.description}>
        <Typography display="inline" variant="h3" className={classes.tvlText}>
          {tvlText}
          <StyledTooltip title={tooltipText} className={classes.tooltip}>
            <InfoOutlined />
          </StyledTooltip>
        </Typography>
        <Typography
          display="inline"
          style={{ marginLeft: "auto", marginRight: "8px" }}
        >
          at this time
        </Typography>
        <Typography display="inline" variant="h3" className={classes.tvlText}>
          {allTimeTVL}
        </Typography>
      </div>
      <div className={classes.displayBy}>
        {!selectedChainDetail ? (
          <>
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
          </>
        ) : null}
        {displayBy === "Time" && !selectedChainDetail ? (
          <>
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
              {Object.keys(TIME_FRAMES).map(
                (timeFrame /* TODO: memoize ? */) => (
                  <MenuItem key={timeFrame} value={timeFrame}>
                    {timeFrame}
                  </MenuItem>
                )
              )}
            </TextField>
          </>
        ) : selectedChainDetail ? (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => {
              setSelectedChainDetail(null);
            }}
          >
            Back to all chains
          </Button>
        ) : null}
      </div>
      <Paper className={classes.mainPaper}>
        {displayBy === "Time" ? (
          cumulativeTVL.data ? (
            allChainsSelected ? (
              <TVLAreaChart
                cumulativeTVL={cumulativeTVL.data}
                timeFrame={TIME_FRAMES[timeFrame]}
              />
            ) : (
              <TVLLineChart
                cumulativeTVL={cumulativeTVL.data}
                timeFrame={TIME_FRAMES[timeFrame]}
                selectedChains={selectedChains}
              />
            )
          ) : (
            <CircularProgress />
          )
        ) : selectedChainDetail ? (
          <ChainTVLTable chainInfo={selectedChainDetail} />
        ) : (
          <ChainTVLChart
            tvl={tvl}
            onChainSelected={handleChainDetailSelected}
          />
        )}
      </Paper>
    </>
  );
};

export default TVLStats;
