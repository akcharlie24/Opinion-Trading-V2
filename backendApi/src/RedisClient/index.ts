import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient: ReturnType<typeof createClient> | null = null;

export async function createRedisClientConnection(): Promise<void> {
  if (!redisClient || !redisClient?.isOpen) {
    try {
      const client = createClient({
        url: process.env.UPSTASH_REDIS_URL,
      });
      await client.connect();

      redisClient = client;
    } catch (err) {
      console.log("Error connecting to redis client", err);
    }
  }
}

export { redisClient };
