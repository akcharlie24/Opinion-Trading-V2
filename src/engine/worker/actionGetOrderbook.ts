import { ORDERBOOK } from "../variables";

export function actionGetOrderbook() {
  const orderbook = ORDERBOOK;

  const response = { data: orderbook };

  return response;
}
