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
import { useTVL } from "../../../hooks/useTVL";
import { COLORS } from "../../../muiTheme";
import { ChainInfo } from "../../../utils/consts";
import HeaderText from "../../HeaderText";
import SmartAddress from "../../SmartAddress";
import { balancePretty } from "../../TokenSelectors/TokenPicker";
import MuiReactTable from "../tableComponents/MuiReactTable";
import { formatTVL } from "./utils";

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

const TVLTable = ({ chainInfo }: { chainInfo: ChainInfo }) => {
  const classes = useStyles();
  const tvl = useTVL();
  const chainTVL = useMemo(() => {
    return tvl.data?.filter((x) => x.originChainId === chainInfo.id);
  }, [chainInfo, tvl]);

  const sortTokens = useMemo(() => {
    return (rowA: any, rowB: any) => {
      if (rowA.isGrouped && rowB.isGrouped) {
        return rowA.values.assetAddress > rowB.values.assetAddress ? 1 : -1;
      } else if (rowA.isGrouped && !rowB.isGrouped) {
        return 1;
      } else if (!rowA.isGrouped && rowB.isGrouped) {
        return -1;
      } else if (rowA.original.symbol && !rowB.original.symbol) {
        return 1;
      } else if (rowB.original.symbol && !rowA.original.symbol) {
        return -1;
      } else if (rowA.original.symbol && rowB.original.symbol) {
        return rowA.original.symbol > rowB.original.symbol ? 1 : -1;
      } else {
        return rowA.original.assetAddress > rowB.original.assetAddress ? 1 : -1;
      }
    };
  }, []);
  const tvlColumns = useMemo(() => {
    const maxTotalValue =
      chainTVL?.reduce((maxTotalValue, tvl) => {
        return Math.max(maxTotalValue, tvl.totalValue || 0);
      }, 0) || 0;

    return [
      {
        Header: "Token",
        id: "assetAddress",
        sortType: sortTokens,
        disableGroupBy: true,
        accessor: (value: any) => ({
          chainId: value.originChainId,
          symbol: value.symbol,
          name: value.name,
          logo: value.logo,
          assetAddress: value.assetAddress,
        }),
        Cell: (value: any) => (
          <div className={classes.tokenContainer}>
            <div className={classes.logoPositioner}>
              {value.row?.original?.logo ? (
                <img
                  src={value.row?.original?.logo}
                  alt=""
                  className={classes.logo}
                />
              ) : null}
            </div>
            <SmartAddress
              chainId={value.row?.original?.originChainId}
              address={value.row?.original?.assetAddress}
              symbol={value.row?.original?.symbol}
              tokenName={value.row?.original?.name}
            />
          </div>
        ),
      },
      {
        Header: "Quantity",
        accessor: "amount",
        disableGroupBy: true,
        Cell: (value: any) =>
          value.row?.original?.amount !== undefined
            ? numeral(value.row?.original?.amount).format("0,0.00")
            : "",
      },
      {
        Header: "Unit Price",
        accessor: "quotePrice",
        disableGroupBy: true,
        Cell: (value: any) =>
          value.row?.original?.quotePrice !== undefined
            ? numeral(value.row?.original?.quotePrice).format("0,0.00")
            : "",
      },
      {
        Header: "Value (USD)",
        id: "totalValue",
        accessor: "totalValue",
        disableGroupBy: true,
        Cell: (value: any) =>
          value.row?.original?.totalValue !== undefined
            ? formatTVL(value.row?.original?.totalValue)
            : "",
      },
    ];
  }, [
    classes.logo,
    classes.tokenContainer,
    classes.logoPositioner,
    sortTokens,
    chainTVL,
  ]);

  return !tvl.isFetching ? (
    <MuiReactTable
      columns={tvlColumns}
      data={chainTVL || []}
      skipPageReset={false}
      initialState={{ sortBy: [{ id: "totalValue", desc: true }] }}
    />
  ) : (
    <CircularProgress className={classes.alignCenter} />
  );
};

export default TVLTable;
