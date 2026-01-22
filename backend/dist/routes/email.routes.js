"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const email_controller_1 = require("../controllers/email.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
/**
 * Schedule new emails (CSV upload)
 */
router.post("/schedule", upload.single("file"), email_controller_1.scheduleEmails);
/**
 * Dashboard APIs
 */
router.get("/scheduled", email_controller_1.getScheduledEmails);
router.get("/sent", email_controller_1.getSentEmails);
exports.default = router;
