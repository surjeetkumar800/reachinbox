import nodemailer from "nodemailer";
import { env } from "../config/env";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * SMTP transporter (Ethereal)
 */
const transporter = nodemailer.createTransport({
  host: env.ETHEREAL_HOST,
  port: env.ETHEREAL_PORT,
  secure: false, // Ethereal uses STARTTLS, not SMTPS
  auth: {
    user: env.ETHEREAL_USER,
    pass: env.ETHEREAL_PASS,
  },
});

/**
 * Send email using SMTP
 * NOTE:
 * - Rate limiting is handled at the Worker level (not here)
 * - This service is a pure mail sender
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailInput): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: `"ReachInbox" <${env.ETHEREAL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📨 Email sent to ${to}`);
    console.log(`🆔 Message ID: ${info.messageId}`);

    // Ethereal preview URL (VERY useful for demo)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Preview URL: ${previewUrl}`);
    }
  } catch (error) {
    console.error("❌ Email send failed");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    // Rethrow so Worker can retry / reschedule
    throw error;
  }
};
