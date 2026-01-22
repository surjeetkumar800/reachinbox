import Redis from "ioredis";

let redis: Redis | null = null;

if (process.env.REDIS_HOST) {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,

    // Required for free cloud Redis like Upstash
    tls: process.env.NODE_ENV === "production" ? {} : undefined,

    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 5) return null; // stop retrying
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.on("ready", () => {
    console.log("🟢 Redis ready");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  redis.on("end", () => {
    console.warn("🔴 Redis connection closed");
  });
} else {
  console.warn("⚠️ Redis disabled (REDIS_HOST not set)");
}

export { redis };
