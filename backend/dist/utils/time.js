"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextHourDelay = void 0;
/**
 * Returns delay (ms) until the start of the next hour
 */
const getNextHourDelay = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setUTCMinutes(0, 0, 0);
    nextHour.setUTCHours(now.getUTCHours() + 1);
    return nextHour.getTime() - now.getTime();
};
exports.getNextHourDelay = getNextHourDelay;
