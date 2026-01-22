import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEmailBatch extends Document {
  userId: Types.ObjectId;
  subject: string;
  body: string;
  totalEmails: number;
  scheduledAt: Date;
  status: "scheduled" | "processing" | "completed";
}

const EmailBatchSchema = new Schema<IEmailBatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    totalEmails: { type: Number, required: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "processing", "completed"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

const EmailBatchModel =
  mongoose.models.EmailBatch ||
  mongoose.model<IEmailBatch>("EmailBatch", EmailBatchSchema);

export default EmailBatchModel;
