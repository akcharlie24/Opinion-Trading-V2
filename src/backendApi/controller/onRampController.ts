import { Request, Response } from "express";
import { createRedisClientConnection, redisClient } from "../RedisClient";
import { REQ_QUEUE } from "../constants";
import { actions } from "../../types";
import { pubSubManager } from "../PubSubManager";
const { v4: uuid } = require("uuid");

export const onRampMoney = async (req: Request, res: Response) => {
  if (!redisClient || !redisClient?.isOpen) {
    await createRedisClientConnection();
  }

  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  const { userId, amount } = req.body;
  // TODO: add basic sanitization EVERYWHERE -> when there is user or amount missing

  const id = uuid();

  const data = JSON.stringify({
    id: id,
    action: actions.onRampINR,
    payload: { userId: userId, amount: amount },
  });

  try {
    await redisClient?.lPush(REQ_QUEUE, data);

    await subscriberClient.listenForResponse(id, (message) => {
      const response = JSON.parse(message);
      res.status(200).json({ message: response.message });
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
