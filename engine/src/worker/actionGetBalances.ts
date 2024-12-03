import { INR_BALANCES, STOCK_BALANCES } from "../variables";

export function actionGetAllINRBalance() {
  const inrBalances = INR_BALANCES;
  const response = { data: inrBalances };

  return response;
}

export function actionGetAllStockBalance() {
  const stockBalances = STOCK_BALANCES;
  const response = { data: stockBalances };

  return response;
}

export function actionGetINRBalance(payload: string) {
  const data = JSON.parse(payload);
  const { userId } = data;

  const userBalance = INR_BALANCES[userId];

  if (!userBalance) {
    const response = { message: "There is no user" };
    return response;
  }

  const response = { data: userBalance };

  return response;
}

export function actionGetStockBalance(payload: string) {
  const data = JSON.parse(payload);
  const { userId } = data;

  const stockBalance = STOCK_BALANCES[userId];

  if (!stockBalance) {
    const response = { message: "There is no user" };
    return response;
  }

  const response = { data: stockBalance };

  return response;
}
