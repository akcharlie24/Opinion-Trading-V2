import { createClient, RedisClientType } from "redis";

export class PubSubManager {
  // initially koi instance nhi bna rhe
  private static instance: PubSubManager | null = null;
  private subscriberClient: RedisClientType;
  private publisherClient: RedisClientType;

  private constructor() {
    this.subscriberClient = createClient();
    this.publisherClient = createClient();

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

  // TODO: add logging while connecting and performing async calls
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
      await this.subscriberClient.subscribe(reqId, (message: string) => {
        try {
          callback(message);
        } catch (err) {
          console.log("Error excecuting response recieved");
        }
      });
    } catch (err) {
      console.log("Error subscribing ");
    }
    // TODO: should add a finally here in case the pub/sub has some error
  }
}

export const pubSubManager = PubSubManager.getInstance();
