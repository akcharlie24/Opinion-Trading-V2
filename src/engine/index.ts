import { REQ_QUEUE } from "../backendApi/constants";
import { actions } from "../types";
import { pubSubManager } from "./PubSubManager";
import { createRedisClientConnection, redisClient } from "./RedisClient";
import { actionCreateUser } from "./worker/actionCreateUser";

async function processRequests(request: string) {
  const publisherClient = pubSubManager;
  await publisherClient.connectToRedis();

  const req = JSON.parse(request);

  switch (req.action) {
    case actions.createUser:
      const response = actionCreateUser(JSON.stringify(req.payload));
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
