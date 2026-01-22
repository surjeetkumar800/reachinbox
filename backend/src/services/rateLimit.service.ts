import { redis } from "../config/redis";
import { env } from "../config/env";

/**
 * Hourly rate limit check (Redis based, multi-worker safe)
 * Returns:
 *  - true  → email can be sent now
 *  - false → hourly limit exceeded
 */
export const checkAndIncrementRateLimit = async (
  senderId: string,
): Promise<boolean> => {
  const now = new Date();

  const hourKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
  const redisKey = `email_rate:${senderId}:${hourKey}`;

  // Get current count
  const currentCountRaw = await redis.get(redisKey);
  const currentCount = currentCountRaw ? Number(currentCountRaw) : 0;

  // 🚫 Limit already reached
  if (currentCount >= env.EMAILS_PER_HOUR) {
    return false;
  }

  // ✅ Increment safely
  const newCount = await redis.incr(redisKey);

  // Set expiry only on first increment
  if (newCount === 1) {
    const secondsLeft = 3600 - (now.getUTCMinutes() * 60 + now.getUTCSeconds());

    await redis.expire(redisKey, secondsLeft);
  }

  return true;
};
