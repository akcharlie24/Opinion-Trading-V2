// TODO: give types to seperate folders during production when needed

export interface UserParams {
  userId: string;
}

export interface SymbolParams {
  stockSymbol: string;
}

export interface UserBalance {
  balance: number;
  locked: number;
}

export interface INRBalanceInterface {
  [key: string]: UserBalance;
}

export interface Stock {
  quantity: number;
  locked: number;
}

export interface StockTypeBalance {
  yes?: Stock;
  no?: Stock;
}

export interface StockSymbolBalance {
  [symbol: string]: StockTypeBalance;
}

export interface StockBalancesInterface {
  [user: string]: StockSymbolBalance;
}

enum stockType {
  regular = "regular",
  minted = "minted",
}

export interface StockOrderType {
  [user: string]: {
    [type in stockType]: number;
  };
}

export interface StockOrder {
  total: number;
  orders: StockOrderType;
}

export interface QuantityAtPrice {
  [stockPrice: string]: StockOrder;
}

export interface OrderStockTypeBalance {
  yes?: QuantityAtPrice;
  no?: QuantityAtPrice;
}

export interface OrderBookInterface {
  [symbol: string]: OrderStockTypeBalance;
}

export enum actions {
  "createUser",
  "createSymbol",
  "getOrderbook",
  "getAllINRBalance",
  "getAllStockBalance",
  "getINRBalance",
  "getStockBalance",
}
