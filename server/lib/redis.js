import { createClient } from "redis";

class RedisClient {
  constructor() {
    this.client = createClient({
      url: process.env.RETDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000), // 5s max delay
      },
    });

    this.client.on("error", (err) => console.error("Redis Client Error", err));
    this.client.on("connect", () => console.log("Redis connected"));
    this.client.on("ready", () => console.log("Redis ready"));
    this.client.on("reconnecting", () => console.log("Redis reconnecting"));
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error("Redis GET error:", err);
      return null;
    }
  }

  async setEx(key, seconds, value) {
    try {
      return await this.client.setEx(key, seconds, value);
    } catch (err) {
      console.error("Redis SETEX error:", err);
      return null;
    }
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }
}

const redisClient = new RedisClient();

// Connexion automatique au démarrage
redisClient.connect().catch(console.error);

// Gestion propre de la déconnexion
process.on("SIGINT", async () => {
  await redisClient.disconnect();
  process.exit(0);
});

export { redisClient };
