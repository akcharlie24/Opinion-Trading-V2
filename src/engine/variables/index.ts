import {
  INRBalanceInterface,
  OrderBookInterface,
  StockBalancesInterface,
} from "../../types";

export const INR_BALANCES: INRBalanceInterface = {
  // user1: {
  //   balance: 1000000,
  //   locked: 0,
  // },
  // user2: {
  //   balance: 2000000000,
  //   locked: 10,
  // },
};

export const ORDERBOOK: OrderBookInterface = {
  // BTC_USDT_10_Oct_2024_9_30: {
  //   yes: {
  //     9.5: {
  //       total: 15,
  //       orders: {
  //         user1: {
  //           regular: 5,
  //           minted: 0,
  //         },
  //         user2: {
  //           regular: 10,
  //           minted: 0,
  //         },
  //       },
  //     },
  //   },
  //   no: {},
  // },
};

export const STOCK_BALANCES: StockBalancesInterface = {
  // user1: {
  //   BTC_USDT_10_Oct_2024_9_30: {
  //     yes: {
  //       quantity: 5,
  //       locked: 5,
  //     },
  //     no: {
  //       quantity: 0,
  //       locked: 0,
  //     },
  //   },
  // },
  // user2: {
  //   BTC_USDT_10_Oct_2024_9_30: {
  //     no: {
  //       quantity: 0,
  //       locked: 0,
  //     },
  //     yes: {
  //       quantity: 2,
  //       locked: 13,
  //     },
  //   },
  // },
};
