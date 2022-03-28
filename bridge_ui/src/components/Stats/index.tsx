import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits, parseUnits } from "@ethersproject/units";
import {
  CircularProgress,
  Container,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import clsx from "clsx";
import numeral from "numeral";
import { useMemo } from "react";
import useTVL from "../../hooks/useTVL";
import { COLORS } from "../../muiTheme";
import HeaderText from "../HeaderText";
import SmartAddress from "../SmartAddress";
import { balancePretty } from "../TokenSelectors/TokenPicker";
import TVLStats from "./TVLStats";
import CustodyAddresses from "./CustodyAddresses";
import NFTStats from "./NFTStats";
import MuiReactTable from "./tableComponents/MuiReactTable";
import TransactionMetrics from "./TransactionMetrics";

const useStyles = makeStyles((theme) => ({
  logoPositioner: {
    height: "30px",
    width: "30px",
    maxWidth: "30px",
    marginRight: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  logo: {
    maxHeight: "100%",
    maxWidth: "100%",
  },
  tokenContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  mainPaper: {
    backgroundColor: COLORS.whiteWithTransparency,
    padding: "2rem",
    "& > h, & > p ": {
      margin: ".5rem",
    },
    marginBottom: theme.spacing(8),
  },
  flexBox: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: theme.spacing(4),
    textAlign: "left",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "unset",
    },
  },
  grower: {
    flexGrow: 1,
  },
  explainerContainer: {},
  totalContainer: {
    display: "flex",
    alignItems: "flex-end",
    paddingBottom: 1, // line up with left text bottom
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(1),
    },
  },
  totalValue: {
    marginLeft: theme.spacing(0.5),
    marginBottom: "-.125em", // line up number with label
  },
  alignCenter: {
    margin: "0 auto",
    display: "block",
  },
}));

const StatsRoot = () => {
  const classes = useStyles();
  //   const tvl = useTVL();

  return (
    <Container maxWidth="lg">
      <Container maxWidth="md">
        <HeaderText white>Rock Hard Stats</HeaderText>
      </Container>
      <div className={classes.flexBox}>
        <div className={classes.explainerContainer}>
          <Typography variant="h4">Total Value Locked</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            These assets are currently locked by the Token Bridge contracts.
          </Typography>
        </div>
        <div className={classes.grower} />
        {/*!tvl.isFetching ? (
          <div
            className={clsx(classes.explainerContainer, classes.totalContainer)}
          >
            <Typography
              variant="body2"
              color="textSecondary"
              component="div"
              noWrap
            >
              {"Total (USD)"}
            </Typography>
            <Typography
              variant="h3"
              component="div"
              noWrap
              className={classes.totalValue}
            >
              {tvlString}
            </Typography>
          </div>
        ) : null*/}
      </div>
      {/* <Paper className={classes.mainPaper}> */}
        <TVLStats />
        {/*!tvl.isFetching ? (
          <MuiReactTable
            columns={tvlColumns}
            data={tvl.data || []}
            skipPageReset={false}
            initialState={{ sortBy: [{ id: "totalValue", desc: true }] }}
          />
        ) : (
          <CircularProgress className={classes.alignCenter} />
        )*/}
      {/* </Paper> */}
      {/* <TransactionMetrics /> */}
      {/* <CustodyAddresses /> */}
      {/* <NFTStats /> */}
    </Container>
  );
};

export default StatsRoot;
