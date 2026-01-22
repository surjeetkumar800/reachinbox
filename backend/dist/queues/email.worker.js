"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
const Email_model_1 = __importDefault(require("../models/Email.model"));
const mailer_service_1 = require("../services/mailer.service");
const rateLimit_service_1 = require("../services/rateLimit.service");
const time_1 = require("../utils/time");
/* ================= MongoDB CONNECT ================= */
(async () => {
    try {
        await mongoose_1.default.connect(env_1.env.MONGO_URI);
        console.log("🟢 Worker MongoDB connected");
    }
    catch (err) {
        console.error("❌ Worker MongoDB connection failed");
        process.exit(1);
    }
})();
/* ================= REDIS ================= */
const redisConnection = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
};
/* ================= WORKER ================= */
exports.emailWorker = new bullmq_1.Worker("email-queue", async (job) => {
    const { emailId, to, subject, body, senderId } = job.data;
    /* 1️⃣ Fetch email */
    const email = await Email_model_1.default.findById(emailId);
    if (!email)
        return;
    if (email.status === "sent") {
        console.log("⚠️ Already sent:", emailId);
        return;
    }
    /* 2️⃣ Rate limit */
    const allowed = await (0, rateLimit_service_1.checkAndIncrementRateLimit)(senderId);
    if (!allowed) {
        const delay = (0, time_1.getNextHourDelay)();
        await job.moveToDelayed(Date.now() + delay);
        return;
    }
    /* 3️⃣ Send email */
    await (0, mailer_service_1.sendEmail)({
        to,
        subject,
        html: body,
    });
    /* 4️⃣ Update DB */
    email.status = "sent";
    email.sentAt = new Date();
    await email.save();
    /* 5️⃣ Throttle */
    await new Promise((r) => setTimeout(r, env_1.env.DELAY_BETWEEN_EMAILS_MS));
    console.log(`✅ Email sent → ${to}`);
}, {
    connection: redisConnection,
    concurrency: env_1.env.WORKER_CONCURRENCY,
});
/* ================= LOGS ================= */
exports.emailWorker.on("completed", (job) => {
    console.log("🎉 Job completed:", job.id);
});
exports.emailWorker.on("failed", (job, err) => {
    console.error("❌ Job failed:", job?.id, err.message);
});
