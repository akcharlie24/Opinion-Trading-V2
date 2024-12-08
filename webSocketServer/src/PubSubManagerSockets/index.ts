import { createClient, RedisClientType } from "redis";
// import dotenv from "dotenv";
//
// dotenv.config();

export class PubSubManager {
  private static instance: PubSubManager | null = null;
  private subscriberClient: RedisClientType;

  private constructor() {
    this.subscriberClient = createClient({
      url: process.env.UPSTASH_REDIS_URL,
    });

    this.subscriberClient.on("error", (err) =>
      console.log("redis sub error", err),
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
  }

  async listenForSymbol(
    stockSymbol: string,
    callback: (data: string) => void,
  ): Promise<void> {
    await this.connectToRedis();

    try {
      await this.subscriberClient.subscribe(stockSymbol, (message: string) => {
        try {
          callback(message);
        } catch (err) {
          console.log("Error excecuting response recieved");
        }
      });
    } catch (err) {
      console.log("Error subscribing ");
    }
  }

  async unsubscribeFromStock(stockSymbol: string): Promise<void> {
    await this.connectToRedis();
    await this.subscriberClient.unsubscribe(stockSymbol);
  }
}

export const pubSubManager = PubSubManager.getInstance();
