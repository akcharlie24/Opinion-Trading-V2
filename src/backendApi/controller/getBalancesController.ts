import { Request, Response } from "express";
import { createRedisClientConnection, redisClient } from "../RedisClient";
import { REQ_QUEUE } from "../constants";
import { actions } from "../../types";
import { pubSubManager } from "../PubSubManager";
const { v4: uuid } = require("uuid");

export const getAllINRBalances = async (req: Request, res: Response) => {
  if (!redisClient || !redisClient?.isOpen) {
    await createRedisClientConnection();
  }

  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  const id = uuid();

  const data = JSON.stringify({
    id: id,
    action: actions.getAllINRBalance,
  });

  try {
    await redisClient?.lPush(REQ_QUEUE, data);

    await subscriberClient.listenForResponse(id, (message) => {
      const response = JSON.parse(message);
      res.status(200).send(response.data);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// TODO: can sum up all get reqs in a generic function but dont know wether it will create a load on system
// TODO: can change routes as per tests

export const getAllStockBalances = async (req: Request, res: Response) => {
  if (!redisClient || !redisClient?.isOpen) {
    await createRedisClientConnection();
  }

  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  const id = uuid();

  const data = JSON.stringify({
    id: id,
    action: actions.getAllStockBalance,
  });

  try {
    await redisClient?.lPush(REQ_QUEUE, data);

    await subscriberClient.listenForResponse(id, (message) => {
      const response = JSON.parse(message);
      res.status(200).send(response.data);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getINRBalance = async (req: Request, res: Response) => {
  if (!redisClient || !redisClient?.isOpen) {
    await createRedisClientConnection();
  }

  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  const userId = req.params.userId;

  const id = uuid();

  const data = JSON.stringify({
    id: id,
    action: actions.getINRBalance,
    payload: { userId: userId },
  });

  try {
    await redisClient?.lPush(REQ_QUEUE, data);

    await subscriberClient.listenForResponse(id, (message) => {
      const response = JSON.parse(message);
      res.status(200).send(response);
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStockBalance = async (req: Request, res: Response) => {
  if (!redisClient || !redisClient?.isOpen) {
    await createRedisClientConnection();
  }

  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  const userId = req.params.userId;

  const id = uuid();

  const data = JSON.stringify({
    id: id,
    action: actions.getStockBalance,
    payload: { userId: userId },
  });

  try {
    await subscriberClient.listenForResponse(id, (message) => {
      const response = JSON.parse(message);
      res.status(200).send(response);
    });

    await redisClient?.lPush(REQ_QUEUE, data);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
