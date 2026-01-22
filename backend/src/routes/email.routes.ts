import { Router } from "express";
import multer from "multer";
import {
  scheduleEmails,
  getScheduledEmails,
  getSentEmails,
} from "../controllers/email.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Schedule new emails (CSV upload)
 */
router.post("/schedule", upload.single("file"), scheduleEmails);

/**
 * Dashboard APIs
 */
router.get("/scheduled", getScheduledEmails);
router.get("/sent", getSentEmails);

export default router;
