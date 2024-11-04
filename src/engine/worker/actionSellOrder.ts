import { SellOrderPayload } from "../../types";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../variables";

export function actionSellOrder(payload: string) {
  const data = JSON.parse(payload) as SellOrderPayload;

  let { userId, stockSymbol, quantity, price, stockType } = data;

  if (price <= 0) {
    const response = { message: "Price cannot be 0 or lesser" };
    return response;
  }

  // TODO: handle math gracefully
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

  const priceString = priceToSell.toString();

  let remainingQuantity: number = quantity;
  let oppositeStockType: "yes" | "no" = "yes";

  if (stockType === "yes") oppositeStockType = "no";
  else if (stockType === "no") oppositeStockType = "yes";

  let pricesAvailableToMatch = Object.keys(
    //@ts-ignore
    ORDERBOOK[stockSymbol][oppositeStockType],
  ).map((price) => parseFloat(price));

  if (pricesAvailableToMatch.length > 0) {
    const sortedPricesToMatch = pricesAvailableToMatch.sort((a, b) => a - b);

    // TODO: can do the math in paise as well -> currently doing in rupee
    // math -> math.min or math.round can be used
    // TODO: below logic can be re-written neatly (maybe make a helper function)

    for (const sortedPrice of sortedPricesToMatch) {
      if (remainingQuantity == 0) break;
      if (priceToSell + sortedPrice <= 10) {
        const ordersToMatch = Object.keys(
          // make a lil clean make a sortedPriceString simply
          ORDERBOOK[stockSymbol][oppositeStockType]![sortedPrice.toString()]
            .orders,
        );
        if (ordersToMatch.length == 0) continue;
        for (const order of ordersToMatch) {
          if (remainingQuantity == 0) break;
          const stocksTraded =
            ORDERBOOK[stockSymbol][oppositeStockType]![sortedPrice.toString()]
              .orders[order].quantity <= remainingQuantity
              ? ORDERBOOK[stockSymbol][oppositeStockType]![
                  sortedPrice.toString()
                ].orders[order].quantity
              : remainingQuantity;

          const oppositeBalanceTradedRegular = sortedPrice * stocksTraded * 100;
          const oppositeBalanceTradedMinted =
            (10 - sortedPrice) * stocksTraded * 100;
          const balanceTraded = priceToSell * stocksTraded * 100;

          INR_BALANCES[userId].balance += balanceTraded;

          if (
            ORDERBOOK[stockSymbol][oppositeStockType]![sortedPrice.toString()]
              .orders[order].type == "regular"
          ) {
            //@ts-ignore
            STOCK_BALANCES[order][stockSymbol][oppositeStockType]?.locked -=
              stocksTraded;
            INR_BALANCES[order].balance += oppositeBalanceTradedRegular;
          } else if (
            ORDERBOOK[stockSymbol][oppositeStockType]![sortedPrice.toString()]
              .orders[order].type == "minted"
          ) {
            // TODO: keep in mind while buying to atleast create the quantity in their portfolio

            // @ts-ignore
            STOCK_BALANCES[order][stockSymbol][stockType]?.quantity +=
              stocksTraded;
            INR_BALANCES[order].locked -= oppositeBalanceTradedMinted;
          }

          remainingQuantity -= stocksTraded;

          ORDERBOOK[stockSymbol][oppositeStockType]![
            sortedPrice.toString()
          ].orders[order].quantity -= stocksTraded;
          if (
            ORDERBOOK[stockSymbol][oppositeStockType]![sortedPrice.toString()]
              .orders[order].quantity == 0
          )
            delete ORDERBOOK[stockSymbol][oppositeStockType]![
              sortedPrice.toString()
            ].orders[order];

          ORDERBOOK[stockSymbol][oppositeStockType]![
            sortedPrice.toString()
          ].total -= stocksTraded;
          if (
            ORDERBOOK[stockSymbol][oppositeStockType]![sortedPrice.toString()]
              .total == 0
          )
            delete ORDERBOOK[stockSymbol][oppositeStockType]![
              sortedPrice.toString()
            ];
        }
      }
    }
    if (remainingQuantity == 0) {
      const response = {
        message: "Matched the sell orders, balance transferred",
      };
      return response;
    }
  }

  if (pricesAvailableToMatch.length == 0 || remainingQuantity != 0) {
    STOCK_BALANCES[userId][stockSymbol][stockType]!.locked += remainingQuantity;

    //@ts-ignore
    if (priceString in ORDERBOOK[stockSymbol][stockType]) {
      // TODO: CHECK can there be a case where there can be a price string but no total / orders ?
      // TODO: while buying make sure to delete the price Strings where the total goes to 0

      ORDERBOOK[stockSymbol][stockType]![priceString].total +=
        remainingQuantity;

      ORDERBOOK[stockSymbol][stockType]![priceString].orders[userId] = {
        type: "regular",
        quantity:
          userId in ORDERBOOK[stockSymbol][stockType]![priceString].orders
            ? ORDERBOOK[stockSymbol][stockType]![priceString].orders[userId]
                .quantity + remainingQuantity
            : remainingQuantity,
      };
    } else {
      ORDERBOOK[stockSymbol][stockType]![priceString] = {
        total: remainingQuantity,
        orders: {
          [userId]: {
            type: "regular",
            quantity: remainingQuantity,
          },
        },
      };
    }
    const response = {
      message: `Market sell ${stockType} Order placed successfully`,
    };

    return response;
  }
}
