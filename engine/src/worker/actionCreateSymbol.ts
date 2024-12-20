import { ORDERBOOK, STOCK_BALANCES } from "../variables";

// TODO: can add return types later
export function actionCreateSymbol(payload: string) {
  const data = JSON.parse(payload);

  const { stockSymbol } = data;

  // TODO: early exit if symbol alerady exists
  // BUT thats the LOOPHOLE -> you will have to search for symbols WHERE ?

  if (!stockSymbol) {
    const response = { messsage: "Please enter the stockSymbol" };
    return response;
  }

  if (stockSymbol in ORDERBOOK) {
    const response = { message: "Symbol alerady exists" };
    return response;
  }

  const users = Object.keys(STOCK_BALANCES);
  // TODO: handle Rare Case where there may be no user still trying to create stockSymbol

  for (const user of users) {
    // TODO: this is a bad approach as told by sujith (there can be multiple thousand users)
    //  a stock portfolio should be created only when
    // 1. user mints on that stock symbol
    // 2. user buys that stock
    // One Loophole that stock might not exist

    // TODO: create symbols in the orderbook instead  also FIX the check conditions if any related to stocks alerady being present in portfolio

    ORDERBOOK[stockSymbol] = {
      yes: {},
      no: {},
    };

    // TODO: remove the stockSymbol creation in portfolio

    STOCK_BALANCES[user]![stockSymbol] = {
      yes: {
        quantity: 0,
        locked: 0,
      },
      no: {
        quantity: 0,
        locked: 0,
      },
    };
  }

  const response = { message: `Symbol ${stockSymbol} created` };
  return response;
}
