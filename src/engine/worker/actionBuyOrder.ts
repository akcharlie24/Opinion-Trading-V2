import { BuyOrderPayload } from "../../types";
import { matchTrade } from "../helper";
import { INR_BALANCES, ORDERBOOK, STOCK_BALANCES } from "../variables";

export function actionBuyOrder(payload: string) {
  const data = JSON.parse(payload) as BuyOrderPayload;
  let { userId, stockSymbol, quantity, price, stockType } = data;

  if (!(userId in INR_BALANCES)) {
    const response = { message: "User Not Found" };
    return response;
  }

  let balance = INR_BALANCES[userId].balance;
  const totalBuyPrice = quantity * price;

  // TODO: best match even if the same price if available ?
  // so this is a problem -> PROBO doesnt have a best match thing -> just puts your order at pending until its matched
  // sol -> 1. either do a best match (will be doing this for now (dont need matching in the reverse orders this way))
  //     -> 2. (better approach will change to this one later on) let the user buy at 8.5 and do minting (no best match) -> just create a reverse and probo makes profit by minting

  // TODO: fix in the case of best match -> this should not come up as user might have enough funds to best match
  if (balance < totalBuyPrice) {
    const response = { message: "Not enough balance" };
    return response;
  }

  if (!(stockSymbol in ORDERBOOK)) {
    const response = {
      message: "No such stock exists for buying",
    };
    return response;
  }

  if (!(stockType in ORDERBOOK[stockSymbol])) {
    const response = { message: "No stock available for buying in orderbook" };
    return response;
  }

  const priceToBuy: number = price / 100;

  //@ts-ignore // as we alerady know that ORDERBOOK[stockSymbol][stockType] will be there
  const pricesAvailable = Object.keys(ORDERBOOK[stockSymbol][stockType]).map(
    (price) => parseFloat(price),
  );
  const sortedPrices = pricesAvailable.sort((a, b) => a - b);

  // prereq to chk if portfolio exists or not
  if (!(userId in STOCK_BALANCES)) {
    STOCK_BALANCES[userId] = {};
  }

  if (!(stockSymbol in STOCK_BALANCES[userId])) {
    STOCK_BALANCES[userId][stockSymbol] = {
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

  // TODO: can think if there may be no locked but quantity -> most prolly no
  if (!(stockType in STOCK_BALANCES[userId][stockSymbol])) {
    STOCK_BALANCES[userId][stockSymbol][stockType] = {
      quantity: 0,
      locked: 0,
    };
  }

  try {
    // TODO: handle responses a little gracefully
    matchTrade(userId, price, quantity, stockType, stockSymbol);
    const response = { message: "Buy Order Placed Successfully" };
    return response;
  } catch (err) {
    const response = { message: `Error Purchasing \n ${err}` };
    return response;
  }
}
