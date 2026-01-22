import { redis } from "../config/redis";
import { env } from "../config/env";

/**
 * Hourly rate limit check (Redis-based, multi-worker safe)
 * Returns:
 *  - true  → email can be sent
 *  - false → hourly limit exceeded
 *
 * Redis unavailable → fail-open (allow sending)
 */
export const checkAndIncrementRateLimit = async (
  senderId: string,
): Promise<boolean> => {
  // 🔒 Redis disabled or not connected
  if (!redis) {
    return true;
  }

  const now = new Date();

  const hourKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
  const redisKey = `email_rate:${senderId}:${hourKey}`;

  // Get current count
  const currentCountRaw = await redis.get(redisKey);
  const currentCount = currentCountRaw ? Number(currentCountRaw) : 0;

  // 🚫 Limit reached
  if (currentCount >= env.EMAILS_PER_HOUR) {
    return false;
  }

  // ✅ Increment atomically
  const newCount = await redis.incr(redisKey);

  // Set expiry only once
  if (newCount === 1) {
    const secondsLeft = 3600 - (now.getUTCMinutes() * 60 + now.getUTCSeconds());

    await redis.expire(redisKey, secondsLeft);
  }

  return true;
};
