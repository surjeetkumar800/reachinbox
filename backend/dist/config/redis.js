"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
exports.redis = redis;
if (process.env.REDIS_HOST) {
    exports.redis = redis = new ioredis_1.default({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD || undefined,
        // Required for free cloud Redis like Upstash
        tls: process.env.NODE_ENV === "production" ? {} : undefined,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
            if (times > 5)
                return null; // stop retrying
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
}
else {
    console.warn("⚠️ Redis disabled (REDIS_HOST not set)");
}
