import { Queue } from "bullmq";
import type { RedisOptions } from "ioredis";
import { env } from "../config/env";

/* ================= REDIS ================= */
const redisConnection: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

/* ================= QUEUE ================= */
export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,

    // 🔥 IMPORTANT
    attempts: 10,

    backoff: {
      type: "custom",
    },
  },
});
