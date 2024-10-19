import { createClient } from "redis";
import { PushResponseParams } from "../types";

const client = createClient();
const client2 = createClient();
client.on("error", (err: Error) => console.log("Redis Error", err)).connect();
client2.on("error", (err: Error) => console.log("Redis Error", err)).connect();

const REQ_QUEUE = "requestQueue";
const RES_STREAM = "responseStream";
const CONSUMER_GROUP = "responseGroup";
const CONSUMER_NAME = "backendConsumer";

const INR_BALANCES = {
  // user1: {
  //   balance: 1000000,
  //   locked: 0,
  // },
  // user2: {
  //   balance: 2000000000,
  //   locked: 10,
  // },
};

const ORDERBOOK = {
  // BTC_USDT_10_Oct_2024_9_30: {
  //   yes: {
  //     9.5: {
  //       total: 12,
  //       orders: {
  //         user1: 2,
  //         user2: 10,
  //       },
  //     },
  //     8.5: {
  //       total: 6,
  //       orders: {
  //         user1: 3,
  //         user2: 3,
  //       },
  //     },
  //   },
  //   no: {},
  // },
};

const STOCK_BALANCES = {
  // user1: {
  //   BTC_USDT_10_Oct_2024_9_30: {
  //     yes: {
  //       quantity: 5,
  //       locked: 5,
  //     },
  //     no: {
  //       quantity: 0,
  //       locked: 0,
  //     },
  //   },
  // },
  // user2: {
  //   BTC_USDT_10_Oct_2024_9_30: {
  //     no: {
  //       quantity: 0,
  //       locked: 0,
  //     },
  //     yes: {
  //       quantity: 2,
  //       locked: 13,
  //     },
  //   },
  // },
};

async function pushResponse({ id, status, data }: PushResponseParams) {
  try {
    await client2.xAdd(RES_STREAM, "*", { data: data });
  } catch (err) {
    console.log(err);
  }
}

async function pullRequests() {
  try {
    console.log("Started Pulling from queue");

    while (true) {
      try {
        const requestRecieved = await client.brPop(REQ_QUEUE, 0);
        const request = JSON.parse(requestRecieved!.element);
        if (request) {
          console.log(request);
          const { id, endpoint, type, data } = request;
          console.log(endpoint);

          pushResponse({
            id: "122112",
            status: "ksdjfkj",
            // TODO: just stringify the data and then send
            data: "sdkjf",
          });
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
