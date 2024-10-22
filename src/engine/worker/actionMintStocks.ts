import { INR_BALANCES, STOCK_BALANCES } from "../variables";

export function actionMintStocks(payload: string) {
  const data = JSON.parse(payload);

  let { userId, stockSymbol, quantity } = data;

  if (!(userId in INR_BALANCES)) {
    const response = { message: "User doesnt exist" };
    return response;
  }

  quantity = parseInt(quantity);
  const priceOfTokens = quantity * 1000;
  const balance = INR_BALANCES[userId].balance;

  if (priceOfTokens > balance) {
    const response = { message: "Insufficient Balance" };
    return response;
  }

  INR_BALANCES[userId].balance -= priceOfTokens;

  if (!(userId in STOCK_BALANCES)) {
    STOCK_BALANCES[userId] = {};
  }

  // TODO: LOOPHOLE here is that the stockSymbol may yet not be created
  if (!(stockSymbol in STOCK_BALANCES[userId])) {
    STOCK_BALANCES[userId][stockSymbol] = {};
  }

  // TODO: Ensure that u create new stockSymbol/quantities/locked while handling SELL/BUY

  STOCK_BALANCES[userId][stockSymbol] = {
    yes: {
      quantity:
        "yes" in STOCK_BALANCES[userId][stockSymbol]
          ? STOCK_BALANCES[userId][stockSymbol]!.yes!.quantity + quantity
          : quantity,
      locked:
        "yes" in STOCK_BALANCES[userId][stockSymbol]
          ? STOCK_BALANCES[userId][stockSymbol]!.yes!.locked
          : 0,
    },
    no: {
      quantity:
        "no" in STOCK_BALANCES[userId][stockSymbol]
          ? STOCK_BALANCES[userId][stockSymbol]!.no!.quantity + quantity
          : quantity,
      locked:
        "no" in STOCK_BALANCES[userId][stockSymbol]
          ? STOCK_BALANCES[userId][stockSymbol]!.no!.locked
          : 0,
    },
  };

  const remainingBalance = balance - priceOfTokens;

  const response = {
    message: `Minted ${quantity} 'yes' and 'no' tokens for user ${userId}, remaining balance is ${remainingBalance}`,
  };

  return response;
}
