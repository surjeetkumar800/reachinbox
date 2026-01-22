/**
 * Returns delay (ms) until the start of the next hour
 */
export const getNextHourDelay = (): number => {
  const now = new Date();

  const nextHour = new Date(now);
  nextHour.setUTCMinutes(0, 0, 0);
  nextHour.setUTCHours(now.getUTCHours() + 1);

  return nextHour.getTime() - now.getTime();
};
