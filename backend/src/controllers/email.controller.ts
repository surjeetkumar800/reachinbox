import { Request, Response } from "express";
import type { Multer } from "multer";
import EmailBatchModel from "../models/EmailBatch.model";
import EmailModel from "../models/Email.model";
import { emailQueue } from "../queues/email.queue";
import { parseCSVEmails } from "../utils/csvParser";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const scheduleEmails = async (req: MulterRequest, res: Response) => {
  try {
    const { subject, body, scheduledAt, recipients, senderId } = req.body;

    if (!subject || !body || !scheduledAt || !senderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let emailList: string[] = [];

    /* ===== CASE 1: CSV uploaded ===== */
    if (req.file) {
      emailList = await parseCSVEmails(req.file.buffer);
    }

    /* ===== CASE 2: JSON recipients ===== */
    if (!emailList.length && recipients) {
      emailList = JSON.parse(recipients);
    }

    if (!emailList.length) {
      return res.status(400).json({
        success: false,
        message: "No email recipients found",
      });
    }

    const batch = await EmailBatchModel.create({
      userId: senderId,
      subject,
      body,
      totalEmails: emailList.length,
      scheduledAt: new Date(scheduledAt),
    });

    const baseTime = new Date(scheduledAt).getTime();

    for (let i = 0; i < emailList.length; i++) {
      const emailDoc = await EmailModel.create({
        batchId: batch._id,
        to: emailList[i],
        subject,
        body,
        senderId,
        scheduledAt: new Date(baseTime),
        status: "scheduled",
      });

      await emailQueue.add(
        "email-job",
        {
          emailId: emailDoc._id.toString(),
          to: emailList[i],
          subject,
          body,
          senderId,
        },
        {
          delay: Math.max(baseTime - Date.now(), 0),
          jobId: emailDoc._id.toString(), // idempotent
        },
      );
    }

    return res.status(201).json({
      success: true,
      message: "Emails scheduled successfully",
      batchId: batch._id,
      totalEmails: emailList.length,
    });
  } catch (err) {
    console.error("Schedule email error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to schedule emails",
    });
  }
};

/**
 * Get scheduled emails
 */
export const getScheduledEmails = async (req: Request, res: Response) => {
  try {
    const emails = await EmailModel.find({ status: "scheduled" })
      .sort({ scheduledAt: 1 })
      .lean();

    return res.json({
      success: true,
      data: emails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scheduled emails",
    });
  }
};

/**
 * Get sent emails
 */
export const getSentEmails = async (req: Request, res: Response) => {
  try {
    const emails = await EmailModel.find({ status: "sent" })
      .sort({ sentAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: emails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent emails",
    });
  }
};
