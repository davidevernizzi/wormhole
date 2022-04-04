import axios from "axios";
import { useEffect, useState } from "react";
import {
  DataWrapper,
  errorDataWrapper,
  fetchDataWrapper,
  receiveDataWrapper,
} from "../store/helpers";

export interface BidirectionalTransferData {
  [leavingChainId: string]: {
    [destinationChainId: string]: {
      [tokenSymbol: string]: number;
    };
  };
}

export interface NotionalTransferred {
  Last24Hours: BidirectionalTransferData;
  WithinPeriod: BidirectionalTransferData;
  PeriodDurationDays: number;
  Daily: {
    [date: string]: BidirectionalTransferData;
  };
}

const useNotionalTransferred = () => {
  const [notionalTransferred, setNotionalTransferred] = useState<
    DataWrapper<NotionalTransferred>
  >(fetchDataWrapper());

  useEffect(() => {
    let cancelled = false;
    axios
      .get<NotionalTransferred>("./notionaltransferred.json")
      .then((response) => {
        if (!cancelled) {
          setNotionalTransferred(receiveDataWrapper(response.data));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setNotionalTransferred(errorDataWrapper(error));
        }
        console.error(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return notionalTransferred;
};

export default useNotionalTransferred;
