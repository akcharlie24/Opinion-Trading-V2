import { createClient, RedisClientType } from "redis";
// import dotenv from "dotenv";
//
// dotenv.config();

export class PubSubManager {
  private static instance: PubSubManager | null = null;
  private subscriberClient: RedisClientType;
  private publisherClient: RedisClientType;

  private constructor() {
    this.subscriberClient = createClient({
      url: process.env.UPSTASH_REDIS_URL,
    });
    this.publisherClient = createClient({
      url: process.env.UPSTASH_REDIS_URL,
    });

    this.subscriberClient.on("error", (err) =>
      console.log("redis sub error", err),
    );
    this.publisherClient.on("error", (err) =>
      console.log("redis pub error", err),
    );
  }

  public static getInstance(): PubSubManager {
    if (!PubSubManager.instance) {
      PubSubManager.instance = new PubSubManager();
    }
    return PubSubManager.instance;
  }

  async connectToRedis(): Promise<void> {
    try {
      if (!this.subscriberClient.isOpen) {
        await this.subscriberClient.connect();
      }
    } catch (err) {
      console.log("Error Creating subscriberClient");
      console.log(err);
    }
    try {
      if (!this.publisherClient.isOpen) {
        await this.publisherClient.connect();
      }
    } catch (err) {
      console.log("Error Creating subscriberClient");
      console.log(err);
    }
  }

  async publishResponse(reqId: string, payload: string): Promise<void> {
    await this.connectToRedis();

    try {
      await this.publisherClient.publish(reqId, payload);
    } catch (err) {
      console.log("Error Publishing Response ");
      console.log(err);
    }
  }

  async listenForResponse(
    reqId: string,
    callback: (data: string) => void,
  ): Promise<void> {
    await this.connectToRedis();

    try {
      // FIX: unsubscribe to the reqId after executing the callback and also do a promise to unsubscribe in 2 sec response timed out
      //  BEST: fix would be to rather create a single channel and implement a map (will need refactoring)

      await this.subscriberClient.subscribe(reqId, (message: string) => {
        try {
          callback(message);
          // below might be a partial fix
          // this.subscriberClient.unsubscribe(reqId)
        } catch (err) {
          console.log("Error excecuting response recieved");
        }
      });
    } catch (err) {
      console.log("Error subscribing ");
    }
  }
}

export const pubSubManager = PubSubManager.getInstance();
