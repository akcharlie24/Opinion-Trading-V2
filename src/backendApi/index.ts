import express from "express";
import { createClient } from "redis";
// import { v4 as uuidv4 } from 'uuid';
const { v4: uuidv4 } = require("uuid");

const app = express();

const client = createClient();
const client2 = createClient();

client.on("error", (err: Error) => console.log("Redis Error", err)).connect();
client2.on("error", (err: Error) => console.log("Redis Error", err)).connect();

const REQ_QUEUE = "requestQueue";
const RES_STREAM = "responseStream";
const CONSUMER_GROUP = "responseGroup";
const CONSUMER_NAME = "backendConsumer";

const responseMap = new Map();

async function createConsumerGroup() {
  try {
    await client2.xGroupCreate(RES_STREAM, CONSUMER_GROUP, "0", {
      MKSTREAM: true,
    });
  } catch (err: any) {
    if (!err.message.includes("BUSYGROUP")) {
      console.error("Error creating consumer group:", err);
    }
  }
}

async function addToQueue(data: string) {
  try {
    await client.lPush(REQ_QUEUE, data);
  } catch (err) {
    console.log(err);
  }
}

async function fetchResponse() {
  createConsumerGroup();

  while (true) {
    try {
      const response = await client2.xReadGroup(
        CONSUMER_GROUP,
        CONSUMER_NAME,
        { key: RES_STREAM, id: ">" },
        { COUNT: 1, BLOCK: 0 },
      );

      if (response) {
        console.log(JSON.stringify(response));
        for (const responseObj of response) {
          for (const message of responseObj.messages) {
            const { id, message: data } = message;
            console.log(data.key);
          }
        }
      }

      // TODO: add acknowledgement too
    } catch (err) {
      console.error("Error reading from Redis stream:", err);
    }
  }
}

fetchResponse();

app.post(
  "/user/create/:userId",
  // TODO: add Request and Response schemas later on
  (req: express.Request, res: express.Response) => {
    const userId = req.params.userId;
    const id = uuidv4();
    //make sure every value in key is a string
    const data = {
      id: id,
      endpoint: req.url,
      type: req.method,
      data: {
        userId: userId,
      },
    };

    responseMap.set(id, res);
    addToQueue(JSON.stringify(data));
  },
);

app.listen("3000", () => {
  console.log("started on 3000");
});
