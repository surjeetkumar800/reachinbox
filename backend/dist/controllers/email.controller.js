"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSentEmails = exports.getScheduledEmails = exports.scheduleEmails = void 0;
const EmailBatch_model_1 = __importDefault(require("../models/EmailBatch.model"));
const Email_model_1 = __importDefault(require("../models/Email.model"));
const email_queue_1 = require("../queues/email.queue");
const csvParser_1 = require("../utils/csvParser");
const scheduleEmails = async (req, res) => {
    try {
        const { subject, body, scheduledAt, recipients, senderId } = req.body;
        if (!subject || !body || !scheduledAt || !senderId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        let emailList = [];
        /* ===== CASE 1: CSV uploaded ===== */
        if (req.file) {
            emailList = await (0, csvParser_1.parseCSVEmails)(req.file.buffer);
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
        const batch = await EmailBatch_model_1.default.create({
            userId: senderId,
            subject,
            body,
            totalEmails: emailList.length,
            scheduledAt: new Date(scheduledAt),
        });
        const baseTime = new Date(scheduledAt).getTime();
        for (let i = 0; i < emailList.length; i++) {
            const emailDoc = await Email_model_1.default.create({
                batchId: batch._id,
                to: emailList[i],
                subject,
                body,
                senderId,
                scheduledAt: new Date(baseTime),
                status: "scheduled",
            });
            await email_queue_1.emailQueue.add("email-job", {
                emailId: emailDoc._id.toString(),
                to: emailList[i],
                subject,
                body,
                senderId,
            }, {
                delay: Math.max(baseTime - Date.now(), 0),
                jobId: emailDoc._id.toString(), // idempotent
            });
        }
        return res.status(201).json({
            success: true,
            message: "Emails scheduled successfully",
            batchId: batch._id,
            totalEmails: emailList.length,
        });
    }
    catch (err) {
        console.error("Schedule email error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to schedule emails",
        });
    }
};
exports.scheduleEmails = scheduleEmails;
/**
 * Get scheduled emails
 */
const getScheduledEmails = async (req, res) => {
    try {
        const emails = await Email_model_1.default.find({ status: "scheduled" })
            .sort({ scheduledAt: 1 })
            .lean();
        return res.json({
            success: true,
            data: emails,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch scheduled emails",
        });
    }
};
exports.getScheduledEmails = getScheduledEmails;
/**
 * Get sent emails
 */
const getSentEmails = async (req, res) => {
    try {
        const emails = await Email_model_1.default.find({ status: "sent" })
            .sort({ sentAt: -1 })
            .lean();
        return res.json({
            success: true,
            data: emails,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sent emails",
        });
    }
};
exports.getSentEmails = getSentEmails;
