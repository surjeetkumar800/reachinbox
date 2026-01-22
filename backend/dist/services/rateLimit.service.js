"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndIncrementRateLimit = void 0;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
/**
 * Hourly rate limit check (Redis based, multi-worker safe)
 * Returns:
 *  - true  → email can be sent now
 *  - false → hourly limit exceeded
 */
const checkAndIncrementRateLimit = async (senderId) => {
    const now = new Date();
    const hourKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
    const redisKey = `email_rate:${senderId}:${hourKey}`;
    // Get current count
    const currentCountRaw = await redis_1.redis.get(redisKey);
    const currentCount = currentCountRaw ? Number(currentCountRaw) : 0;
    // 🚫 Limit already reached
    if (currentCount >= env_1.env.EMAILS_PER_HOUR) {
        return false;
    }
    // ✅ Increment safely
    const newCount = await redis_1.redis.incr(redisKey);
    // Set expiry only on first increment
    if (newCount === 1) {
        const secondsLeft = 3600 - (now.getUTCMinutes() * 60 + now.getUTCSeconds());
        await redis_1.redis.expire(redisKey, secondsLeft);
    }
    return true;
};
exports.checkAndIncrementRateLimit = checkAndIncrementRateLimit;
