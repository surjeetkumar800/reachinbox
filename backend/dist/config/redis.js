"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const env_1 = require("./env");
const redis = new ioredis_1.Redis({
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});
exports.redis = redis;
// Successful connection
redis.on("connect", () => {
    console.log("✅ Redis connected successfully");
});
// Redis is ready to accept commands
redis.on("ready", () => {
    console.log("🟢 Redis is ready");
});
// Connection errors
redis.on("error", (error) => {
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
