"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
/* ================= REDIS ================= */
const redisConnection = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
};
/* ================= QUEUE ================= */
exports.emailQueue = new bullmq_1.Queue("email-queue", {
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
