import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function createRedisClientConnection(): Promise<void> {
  // TODO: add URL wen productionising

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
