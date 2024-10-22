import { REQ_QUEUE } from "../backendApi/constants";
import { actions } from "../types";
import { pubSubManager } from "./PubSubManager";
import { createRedisClientConnection, redisClient } from "./RedisClient";
import { actionCreateSymbol } from "./worker/actionCreateSymbol";
import { actionCreateUser } from "./worker/actionCreateUser";
import {
  actionGetAllINRBalance,
  actionGetAllStockBalance,
  actionGetINRBalance,
  actionGetStockBalance,
} from "./worker/actionGetBalances";
import { actionGetOrderbook } from "./worker/actionGetOrderbook";
import { actionMintStocks } from "./worker/actionMintStocks";
import { actionOnRampINR } from "./worker/actionOnRampINR";
import { actionSellOrder } from "./worker/actionSellOrder";

async function processRequests(request: string) {
  const publisherClient = pubSubManager;
  await publisherClient.connectToRedis();

  const req = JSON.parse(request);

  let response: any;

  switch (req.action) {
    case actions.createUser:
      response = actionCreateUser(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.createSymbol:
      response = actionCreateSymbol(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.getOrderbook:
      response = actionGetOrderbook();
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.getAllINRBalance:
      response = actionGetAllINRBalance();
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.getAllStockBalance:
      response = actionGetAllStockBalance();
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.getINRBalance:
      response = actionGetINRBalance(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.getStockBalance:
      response = actionGetStockBalance(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.onRampINR:
      response = actionOnRampINR(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.mintStocks:
      response = actionMintStocks(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;

    case actions.createSellOrder:
      response = actionSellOrder(JSON.stringify(req.payload));
      publisherClient.publishResponse(req.id, JSON.stringify(response));
      break;
  }
}

async function pullRequests() {
  try {
    if (!redisClient || !redisClient?.isOpen) {
      await createRedisClientConnection();
    }

    console.log("Started Pulling from queue");

    while (true) {
      try {
        const requestRecieved = await redisClient?.brPop(REQ_QUEUE, 0);
        const request = JSON.parse(requestRecieved!.element);
        if (request) {
          const requestString = JSON.stringify(request);
          processRequests(requestString);
        }
      } catch (error) {
        console.error("Error processing request : ", error);
      }
    }
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

pullRequests();
