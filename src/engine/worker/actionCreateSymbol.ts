import { STOCK_BALANCES } from "../variables";

// TODO: can add return types later
export function actionCreateSymbol(payload: string) {
  const data = JSON.parse(payload);

  const { stockSymbol } = data;

  // TODO: early exit if symbol alerady exists

  if (!stockSymbol) {
    const response = { messsage: "Please enter the stockSymbol" };
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

    STOCK_BALANCES[user][stockSymbol] = {
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
