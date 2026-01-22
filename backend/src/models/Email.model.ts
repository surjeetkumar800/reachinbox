import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEmail extends Document {
  batchId: Types.ObjectId;
  to: string;
  subject: string;
  body: string;
  senderId: string;
  status: "scheduled" | "sent" | "failed";
  scheduledAt: Date;
  sentAt?: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "EmailBatch", required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    senderId: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "sent", "failed"],
      default: "scheduled",
    },
    scheduledAt: { type: Date, required: true },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

const EmailModel =
  mongoose.models.Email || mongoose.model<IEmail>("Email", EmailSchema);

export default EmailModel;
