import { BuyOrderPayload } from "../../types";
import { createReverseSellOrder, matchTrade } from "../helper";
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

  if (balance < totalBuyPrice) {
    const response = { message: "Not enough balance" };
    return response;
  }

  // TODO: will need to handle more Gracefully when creating stockSymbols in ORDERBOOK on create symbol route
  if (!(stockSymbol in ORDERBOOK)) {
    const response = {
      message: "No such stock exists for buying in orderbook",
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

  //lowest match
  // TODO: modify this case to be a recursive bestmatch -> even in case of matchedPrice
  if (priceToBuy > sortedPrices[0]) {
    try {
      matchTrade(sortedPrices[0]);
      // TODO: Add message as per cases

      res.status(200).json({ message: "Trade executed" });
      return;
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Transaction Failed" });
      return;
    }
  }

  //normal matching
  const matchedPrice = pricesAvailable.find((price) => price === priceToBuy);

  if (!matchedPrice) {
    try {
      createReverseSellOrder(priceToBuy, quantity);

      let orderToPush = JSON.stringify({
        [stockSymbol]: ORDERBOOK[stockSymbol],
      });
      await client.lPush("orderbook", orderToPush);

      res.status(200).json({ message: "Trade executed successfully" });
    } catch (error) {
      res.status(404).json({ message: "Transaction Failed" });
    }
  } else {
    try {
      matchTrade(matchedPrice);
      // TODO: even if matching occures we need to check if its availabale at lower price

      let orderToPush = JSON.stringify({
        [stockSymbol]: ORDERBOOK[stockSymbol],
      });
      await client.lPush("orderbook", orderToPush);

      res.status(200).json({ message: "Trade executed successfully" });
    } catch (error) {
      console.log(error);
      res.status(404).json({ message: "Transaction Failed" });
    }
  }
}
