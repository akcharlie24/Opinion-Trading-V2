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

enum StockType {
  regular = "regular",
  minted = "minted",
}

export interface StockOrderType {
  [user: string]: {
    [type in StockType]: number;
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
  "onRampINR",
  "mintStocks",
  "createSellOrder",
  "createBuyOrder",
}

export interface SellOrderPayload {
  userId: string;
  stockSymbol: string;
  quantity: number;
  price: number;
  stockType: "yes" | "no";
}
