import { SellOrderPayload } from "../../types";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../variables";

export function actionSellOrder(payload: string) {
  const data = JSON.parse(payload) as SellOrderPayload;

  let { userId, stockSymbol, quantity, price, stockType } = data;

  const priceToSell = price / 100;

  if (!STOCK_BALANCES[userId]) {
    const response = { message: "User doesnt Exist" };
    return response;
  }

  if (!STOCK_BALANCES[userId][stockSymbol]) {
    const response = {
      message: "User has no stocks to sell / No such stock Symbol",
    };
    return response;
  }

  if (!STOCK_BALANCES[userId][stockSymbol][stockType]) {
    const response = { message: "User has no stocks of type needed to sell" };
    return response;
  }

  const userQuantity = STOCK_BALANCES[userId][stockSymbol][stockType]!.quantity;

  if (userQuantity < quantity) {
    const response = { message: "Insufficient Stocks To Sell" };
    return response;
  }

  if (!(stockSymbol in ORDERBOOK)) ORDERBOOK[stockSymbol] = {};
  if (!(stockType in ORDERBOOK[stockSymbol]))
    ORDERBOOK[stockSymbol][stockType] = {};

  STOCK_BALANCES[userId][stockSymbol][stockType]!.quantity -= quantity;
  STOCK_BALANCES[userId][stockSymbol][stockType]!.locked += quantity;

  const priceString = priceToSell.toString();

  //@ts-ignore
  if (priceString in ORDERBOOK[stockSymbol][stockType]) {
    // TODO: CHECK can there be a case where there can be a price string but no total / orders ?
    // TODO: while buying make sure to delete the price Strings where the total goes to 0

    ORDERBOOK[stockSymbol][stockType]![priceString].total += quantity;

    ORDERBOOK[stockSymbol][stockType]![priceString].orders[userId] = {
      regular:
        userId in ORDERBOOK[stockSymbol][stockType]![priceString].orders
          ? ORDERBOOK[stockSymbol][stockType]![priceString].orders[userId]
              .regular + quantity
          : quantity,
      minted: 0,
    };
  } else {
    ORDERBOOK[stockSymbol][stockType]![priceString] = {
      total: quantity,
      orders: {
        [userId]: {
          regular: quantity,
          minted: 0,
        },
      },
    };
  }

  const response = {
    message: `Market sell ${stockType} Order placed successfully`,
  };

  return response;
}
