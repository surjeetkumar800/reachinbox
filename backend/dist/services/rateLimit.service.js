"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndIncrementRateLimit = void 0;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
/**
 * Hourly rate limit check (Redis-based, multi-worker safe)
 * Returns:
 *  - true  → email can be sent
 *  - false → hourly limit exceeded
 *
 * Redis unavailable → fail-open (allow sending)
 */
const checkAndIncrementRateLimit = async (senderId) => {
    // 🔒 Redis disabled or not connected
    if (!redis_1.redis) {
        return true;
    }
    const now = new Date();
    const hourKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
    const redisKey = `email_rate:${senderId}:${hourKey}`;
    // Get current count
    const currentCountRaw = await redis_1.redis.get(redisKey);
    const currentCount = currentCountRaw ? Number(currentCountRaw) : 0;
    // 🚫 Limit reached
    if (currentCount >= env_1.env.EMAILS_PER_HOUR) {
        return false;
    }
    // ✅ Increment atomically
    const newCount = await redis_1.redis.incr(redisKey);
    // Set expiry only once
    if (newCount === 1) {
        const secondsLeft = 3600 - (now.getUTCMinutes() * 60 + now.getUTCSeconds());
        await redis_1.redis.expire(redisKey, secondsLeft);
    }
    return true;
};
exports.checkAndIncrementRateLimit = checkAndIncrementRateLimit;
