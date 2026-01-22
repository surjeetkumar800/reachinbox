import { Redis } from "ioredis";
import { env } from "./env";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

// Successful connection
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

// Redis is ready to accept commands
redis.on("ready", () => {
  console.log("🟢 Redis is ready");
});

// Connection errors
redis.on("error", (error: Error) => {
  console.error("❌ Redis connection error");
  console.error("Reason:", error.message);
});

// Reconnecting logs (useful in production)
redis.on("reconnecting", () => {
  console.warn("⚠️ Redis reconnecting...");
});

// Connection closed
redis.on("end", () => {
  console.warn("🔴 Redis connection closed");
});

export { redis };
