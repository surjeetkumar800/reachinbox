"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return value;
}
exports.env = {
    // Server
    PORT: Number(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    // Database (MongoDB)
    MONGO_URI: required("MONGO_URI"),
    // Redis
    REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
    // Queue & Rate limiting
    WORKER_CONCURRENCY: Number(process.env.WORKER_CONCURRENCY) || 5,
    DELAY_BETWEEN_EMAILS_MS: Number(process.env.DELAY_BETWEEN_EMAILS_MS) || 2000,
    EMAILS_PER_HOUR: Number(process.env.EMAILS_PER_HOUR) || 200,
    // Ethereal Email (SMTP)
    ETHEREAL_HOST: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
    ETHEREAL_PORT: Number(process.env.ETHEREAL_PORT) || 587,
    ETHEREAL_USER: required("ETHEREAL_USER"),
    ETHEREAL_PASS: required("ETHEREAL_PASS"),
    // Google OAuth
    GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
    GOOGLE_CALLBACK_URL: required("GOOGLE_CALLBACK_URL"),
    // Auth / Security
    SESSION_SECRET: required("SESSION_SECRET"),
    JWT_SECRET: required("JWT_SECRET"),
    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000"
};
