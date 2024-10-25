import {
  INRBalanceInterface,
  OrderBookInterface,
  StockBalancesInterface,
} from "../../types";

export const INR_BALANCES: INRBalanceInterface = {
  user1: {
    balance: 1000000,
    locked: 10000,
  },
  user2: {
    balance: 2000000000,
    locked: 20000,
  },
};

export const ORDERBOOK: OrderBookInterface = {
  ETH_USD_15_Oct_2024_12_00: {
    yes: {
      9.5: {
        total: 15,
        orders: {
          user1: {
            quantity: 5,
            type: "regular",
          },
          user2: {
            quantity: 10,
            type: "regular",
          },
        },
      },
      4.5: {
        total: 10,
        orders: {
          user1: {
            quantity: 5,
            type: "regular",
          },
          user2: {
            quantity: 5,
            type: "regular",
          },
        },
      },
      8.5: {
        total: 10,
        orders: {
          user1: {
            quantity: 5,
            type: "regular",
          },
          user2: {
            quantity: 5,
            type: "regular",
          },
        },
      },
    },
    no: {
      3.0: {
        total: 8,
        orders: {
          user1: {
            quantity: 3,
            type: "regular",
          },
          user2: {
            quantity: 5,
            type: "regular",
          },
        },
      },
    },
  },
};

export const STOCK_BALANCES: StockBalancesInterface = {
  user1: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 10,
        locked: 5,
      },
      no: {
        quantity: 3,
        locked: 3,
      },
    },
  },
  user2: {
    ETH_USD_15_Oct_2024_12_00: {
      yes: {
        quantity: 20,
        locked: 10,
      },
      no: {
        quantity: 5,
        locked: 5,
      },
    },
  },
};
