import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../variables";

export function createReverseSellOrder(
  userId: string,
  priceToMatch: number,
  remainingQuantity: number,
  stockType: "yes" | "no",
  stockSymbol: string,
) {
  let quantity = remainingQuantity;

  if (stockType === "no") {
    // TODO: modifying the stockType directly (too lazy) change later
    // Altough may not need to as createReverseSellOrder is generally the last call
    stockType = "yes";
  } else if (stockType === "yes") {
    stockType = "no";
  }

  INR_BALANCES[userId].balance -= quantity * priceToMatch * 100;
  INR_BALANCES[userId].locked += quantity * priceToMatch * 100;

  // TODO: sanitization to check prices >= 10 CAN do that on frontend
  const priceToSell = 10 - priceToMatch;

  const priceString = priceToSell.toString();

  if (!(stockSymbol in ORDERBOOK)) ORDERBOOK[stockSymbol] = {};
  if (!(stockType in ORDERBOOK[stockSymbol]))
    ORDERBOOK[stockSymbol][stockType] = {};

  ORDERBOOK[stockSymbol][stockType]![priceString] = {
    total: ORDERBOOK[stockSymbol][stockType]?.[priceString]?.total
      ? ORDERBOOK[stockSymbol][stockType]![priceString].total + quantity
      : quantity,
    orders: {
      [userId]: {
        quantity: ORDERBOOK[stockSymbol][stockType]?.[priceString]?.orders[
          userId
        ].quantity
          ? (ORDERBOOK[stockSymbol][stockType]![priceString].orders[
              userId
            ].quantity += quantity)
          : quantity,
        // needs complete refactoring
        type: "regular",
      },
    },
  };
}

export function matchTrade(
  userId: string,
  priceToMatch: number,
  quantity: number,
  stockType: "yes" | "no",
  stockSymbol: string,
) {
  //@ts-ignore
  const pricesAvailable = Object.keys(ORDERBOOK[stockSymbol][stockType])
    .map((price) => parseFloat(price))
    .sort((a, b) => a - b);

  let remainingQuantity = quantity;
  for (let price of pricesAvailable) {
    const priceString = price.toString();
  }
}
