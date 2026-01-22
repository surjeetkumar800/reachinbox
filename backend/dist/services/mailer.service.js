"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
/**
 * SMTP transporter (Ethereal)
 */
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.ETHEREAL_HOST,
    port: env_1.env.ETHEREAL_PORT,
    secure: false, // Ethereal uses STARTTLS, not SMTPS
    auth: {
        user: env_1.env.ETHEREAL_USER,
        pass: env_1.env.ETHEREAL_PASS,
    },
});
/**
 * Send email using SMTP
 * NOTE:
 * - Rate limiting is handled at the Worker level (not here)
 * - This service is a pure mail sender
 */
const sendEmail = async ({ to, subject, html, }) => {
    try {
        const info = await transporter.sendMail({
            from: `"ReachInbox" <${env_1.env.ETHEREAL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`📨 Email sent to ${to}`);
        console.log(`🆔 Message ID: ${info.messageId}`);
        // Ethereal preview URL (VERY useful for demo)
        const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 Preview URL: ${previewUrl}`);
        }
    }
    catch (error) {
        console.error("❌ Email send failed");
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(error);
        }
        // Rethrow so Worker can retry / reschedule
        throw error;
    }
};
exports.sendEmail = sendEmail;
