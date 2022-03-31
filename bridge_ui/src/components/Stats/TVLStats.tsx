import {
  Button,
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

const DISPLAY_BY_VALUES = ["Time", "Chain"];

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

const TVLStats = () => {
  const classes = useStyles();

  const [displayBy, setDisplayBy] = useState(DISPLAY_BY_VALUES[0]);
  const [timeFrame, setTimeFrame] = useState("All time");

  const [selectedChains, setSelectedChains] = useState<ChainId[]>([]);

  const [selectedChainDetail, setSelectedChainDetail] =
    useState<ChainInfo | null>(null);

  // TODO: should probably pass this in
  const { cumulativeTVL } = useCumulativeTVL();
  const { tvl } = useTVLNew();

  //const chainTVL = useMemo(() => {
  //  return selectedChainDetail && tvl.data
  //    ? tvl.reduce((sum, x) =>
  //        x.chainId === selectedChainDetail.id ? sum + x.tvl : sum;
  //      , 0)
  //    : null;
  //}, [tvl, selectedChainDetail]);

  // TODO: placeholder number until I figure out why tvl numbers don't match (all time and cumulative today)
  const allTimeTVL = useMemo(() => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    if (!selectedChainDetail)
      return formatter.format(tvl?.AllTime["*"]["*"].Notional || 0);
    return formatter.format(
      tvl?.AllTime[selectedChainDetail.id]["*"].Notional || 0
    );
  }, [selectedChainDetail, tvl]);

  const availableChains = useMemo(() => {
    const chainIds = cumulativeTVL
      ? Object.keys(Object.values(cumulativeTVL.DailyLocked)[0] || {})
          .reduce<ChainId[]>((accum, key) => {
            const chainId = parseInt(key) as ChainId;
            if (CHAINS_BY_ID[chainId] !== undefined) {
              accum.push(chainId);
            }
            return accum;
          }, [])
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
          <Tooltip title={tooltipText} arrow className={classes.tooltip}>
            <InfoOutlined />
          </Tooltip>
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
                <ToggleButton value={value} className={classes.toggleButton}>
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
          allChainsSelected ? (
            <TVLAreaChart cumulativeTVL={cumulativeTVL} timeFrame={timeFrame} />
          ) : (
            <TVLLineChart
              cumulativeTVL={cumulativeTVL}
              timeFrame={timeFrame}
              selectedChains={selectedChains}
            />
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
