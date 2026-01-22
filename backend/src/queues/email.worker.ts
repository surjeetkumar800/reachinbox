import mongoose from "mongoose";
import { Worker, Job } from "bullmq";
import type { RedisOptions } from "ioredis";
import { env } from "../config/env";
import EmailModel from "../models/Email.model";
import { sendEmail } from "../services/mailer.service";
import { checkAndIncrementRateLimit } from "../services/rateLimit.service";
import { getNextHourDelay } from "../utils/time";

/* ================= MongoDB CONNECT ================= */
(async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("🟢 Worker MongoDB connected");
  } catch (err) {
    console.error("❌ Worker MongoDB connection failed");
    process.exit(1);
  }
})();

/* ================= REDIS ================= */
const redisConnection: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

/* ================= JOB DATA ================= */
interface EmailJobData {
  emailId: string;
  to: string;
  subject: string;
  body: string;
  senderId: string;
}

/* ================= WORKER ================= */
export const emailWorker = new Worker<EmailJobData>(
  "email-queue",
  async (job: Job<EmailJobData>) => {
    const { emailId, to, subject, body, senderId } = job.data;

    /* 1️⃣ Fetch email */
    const email = await EmailModel.findById(emailId);
    if (!email) return;

    if (email.status === "sent") {
      console.log("⚠️ Already sent:", emailId);
      return;
    }

    /* 2️⃣ Rate limit */
    const allowed = await checkAndIncrementRateLimit(senderId);

    if (!allowed) {
      const delay = getNextHourDelay();
      await job.moveToDelayed(Date.now() + delay);
      return;
    }

    /* 3️⃣ Send email */
    await sendEmail({
      to,
      subject,
      html: body,
    });

    /* 4️⃣ Update DB */
    email.status = "sent";
    email.sentAt = new Date();
    await email.save();

    /* 5️⃣ Throttle */
    await new Promise((r) => setTimeout(r, env.DELAY_BETWEEN_EMAILS_MS));

    console.log(`✅ Email sent → ${to}`);
  },
  {
    connection: redisConnection,
    concurrency: env.WORKER_CONCURRENCY,
  },
);

/* ================= LOGS ================= */
emailWorker.on("completed", (job) => {
  console.log("🎉 Job completed:", job.id);
});

emailWorker.on("failed", (job, err) => {
  console.error("❌ Job failed:", job?.id, err.message);
});
