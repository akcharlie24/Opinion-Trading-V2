import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../variables";

function resetData(obj: any) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      delete obj[key];
    }
  }
}

export function actionResetData() {
  resetData(ORDERBOOK);
  resetData(STOCK_BALANCES);
  resetData(INR_BALANCES);

  const response = {
    message: "Reset Successful",
  };

  return response;
}
