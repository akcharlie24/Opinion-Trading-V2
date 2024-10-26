import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../variables";

export function createReverseSellOrder(
  userId: string,
  priceToMatch: number,
  remainingQuantity: number,
  stockType: "yes" | "no",
  stockSymbol: string,
) {
  const balanceLocked = priceToMatch * remainingQuantity * 100;

  const oppositeStock = stockType === "yes" ? "no" : "yes";

  // no need of this below one
  if (!(stockSymbol in ORDERBOOK)) ORDERBOOK[stockSymbol] = {};
  if (!(oppositeStock in ORDERBOOK[stockSymbol]))
    ORDERBOOK[stockSymbol][oppositeStock] = {};

  priceToMatch = 10 - priceToMatch;

  INR_BALANCES[userId].locked += balanceLocked;
  const priceString = priceToMatch.toString();

  //@ts-ignore
  if (priceString in ORDERBOOK[stockSymbol][oppositeStock]) {
    ORDERBOOK[stockSymbol][oppositeStock]![priceString].total +=
      remainingQuantity;

    ORDERBOOK[stockSymbol][oppositeStock]![priceString].orders[userId] = {
      type: "minted",
      quantity:
        userId in ORDERBOOK[stockSymbol][oppositeStock]![priceString].orders
          ? ORDERBOOK[stockSymbol][oppositeStock]![priceString].orders[userId]
              .quantity + remainingQuantity
          : remainingQuantity,
    };
  } else {
    ORDERBOOK[stockSymbol][oppositeStock]![priceString] = {
      total: remainingQuantity,
      orders: {
        [userId]: {
          type: "minted",
          quantity: remainingQuantity,
        },
      },
    };
  }
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
  for (const price of pricesAvailable) {
    if (remainingQuantity == 0) break;
    if (price > priceToMatch) break;
    const priceString = price.toString();

    const orders = Object.keys(
      ORDERBOOK[stockSymbol][stockType]![priceString].orders,
    );

    if (orders.length == 0) break;

    for (const order of orders) {
      if (remainingQuantity == 0) break;
      if (order === userId) continue; // avoiding self matching here

      const stocksTraded =
        ORDERBOOK[stockSymbol][stockType]![priceString].orders[order]
          .quantity <= remainingQuantity
          ? ORDERBOOK[stockSymbol][stockType]![priceString].orders[order]
              .quantity
          : remainingQuantity;

      const balanceTradedUser = price * stocksTraded * 100;
      const balanceTradedRegular = price * stocksTraded * 100;
      const balanceTradedMinted = (10 - price) * stocksTraded * 100;

      INR_BALANCES[userId].balance -= balanceTradedUser;
      STOCK_BALANCES[userId][stockSymbol][stockType]!.quantity += stocksTraded;

      if (
        ORDERBOOK[stockSymbol][stockType]![priceString].orders[order].type ==
        "regular"
      ) {
        STOCK_BALANCES[order][stockSymbol][stockType]!.locked -= stocksTraded;
        INR_BALANCES[order].balance += balanceTradedRegular;
      } else if (
        ORDERBOOK[stockSymbol][stockType]![priceString].orders[order].type ==
        "minted"
      ) {
        const oppositeStock = stockType === "yes" ? "no" : "yes";
        INR_BALANCES[order].locked -= balanceTradedMinted;

        if (!STOCK_BALANCES[order][stockSymbol])
          STOCK_BALANCES[order][stockSymbol] = {};
        if (!STOCK_BALANCES[order][stockSymbol][oppositeStock])
          STOCK_BALANCES[order][stockSymbol][oppositeStock] = {
            quantity: 0,
            locked: 0,
          };

        STOCK_BALANCES[order][stockSymbol][oppositeStock].quantity +=
          stocksTraded;
      }
      remainingQuantity -= stocksTraded;

      ORDERBOOK[stockSymbol][stockType]![priceString].orders[order].quantity -=
        stocksTraded;
      if (
        ORDERBOOK[stockSymbol][stockType]![priceString].orders[order]
          .quantity == 0
      )
        delete ORDERBOOK[stockSymbol][stockType]![priceString].orders[order];

      ORDERBOOK[stockSymbol][stockType]![priceString].total -= stocksTraded;
      if (ORDERBOOK[stockSymbol][stockType]![priceString].total == 0)
        delete ORDERBOOK[stockSymbol][stockType]![priceString];
    }
  }

  if (remainingQuantity == 0) return;
  else {
    createReverseSellOrder(
      userId,
      priceToMatch,
      remainingQuantity,
      stockType,
      stockSymbol,
    );
    return;
  }
}
