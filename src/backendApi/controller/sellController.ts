import { Request, Response } from "express";
import { createRedisClientConnection, redisClient } from "../RedisClient";
import { REQ_QUEUE } from "../constants";
import { actions } from "../../types";
import { pubSubManager } from "../PubSubManager";
const { v4: uuid } = require("uuid");

export const createSellOrder = async (req: Request, res: Response) => {
  if (!redisClient || !redisClient?.isOpen) {
    await createRedisClientConnection();
  }

  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  const { userId, stockSymbol, quantity, price, stockType } = req.body;

  if (stockType !== "yes" && stockType !== "no") {
    console.log(stockType);
    res.status(404).json({ message: "Invalid Stock Type" });
  }

  const id = uuid();

  const data = JSON.stringify({
    id: id,
    action: actions.createSellOrder,
    payload: {
      userId: userId,
      stockSymbol: stockSymbol,
      quantity: quantity,
      price: price,
      stockType: stockType,
    },
  });

  try {
    await redisClient?.lPush(REQ_QUEUE, data);

    // FIX: awaits might not be needed as its just attaching an event listener to it and
    // might be causing some latency issues

    await subscriberClient.listenForResponse(id, (message) => {
      const response = JSON.parse(message);
      res.status(200).json({ message: response.message });
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
