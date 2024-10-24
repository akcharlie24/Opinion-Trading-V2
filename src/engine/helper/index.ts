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

  // TODO: sanitization to check prices >= 10
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
  stockType: string,
  stockSymbol: string,
) {
  const orders = Object.keys(
    ORDERBOOK[stockSymbol][stockType][priceToMatch].orders,
  );
  let remainingQuantity = parseFloat(quantity);
  let priceToMatchString = priceToMatch.toString();
  let totalStocksTraded = 0;
  for (let order of orders) {
    if (
      // TODO: its best to delete the user with 0 stocks but here we can simply check
      ORDERBOOK[stockSymbol][stockType][priceToMatchString].orders[order] == 0
    )
      continue;
    if (
      ORDERBOOK[stockSymbol][stockType][priceToMatchString].orders[order] <=
      remainingQuantity
    ) {
      let balanceTraded =
        ORDERBOOK[stockSymbol][stockType][priceToMatchString].orders[order] *
        priceToMatch *
        100;
      let stocksTraded =
        ORDERBOOK[stockSymbol][stockType][priceToMatchString].orders[order];

      INR_BALANCES[order].balance += balanceTraded;
      INR_BALANCES[userId].balance -= balanceTraded;
      STOCK_BALANCES[order][stockSymbol][stockType].locked -= stocksTraded;
      STOCK_BALANCES[userId][stockSymbol][stockType].quantity += stocksTraded;
      ORDERBOOK[stockSymbol][stockType][priceToMatchString].orders[order] -=
        stocksTraded;

      totalStocksTraded += stocksTraded;

      remainingQuantity -= stocksTraded;
      if (remainingQuantity === 0) break;
    } else {
      let balanceTraded = remainingQuantity * priceToMatch * 100;
      let stocksTraded = remainingQuantity;

      INR_BALANCES[order].balance += balanceTraded;
      INR_BALANCES[userId].balance -= balanceTraded;
      STOCK_BALANCES[order][stockSymbol][stockType].locked -= stocksTraded;
      STOCK_BALANCES[userId][stockSymbol][stockType].quantity += stocksTraded;
      ORDERBOOK[stockSymbol][stockType][priceToMatchString].orders[order] -=
        stocksTraded;

      totalStocksTraded += stocksTraded;

      // TODO: its obvios that it will be 0 here
      remainingQuantity -= stocksTraded;
      if (remainingQuantity === 0) break;
    }
  }
  ORDERBOOK[stockSymbol][stockType][priceToMatchString].total -=
    totalStocksTraded;

  if (remainingQuantity === 0) return;
  else {
    createReverseSellOrder(priceToMatch, remainingQuantity);
    return;
  }
}
