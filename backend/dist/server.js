"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
require("./config/redis");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Connect MongoDB
        await (0, db_1.connectDB)();
        const server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            console.log(`⚠️ Received ${signal}. Shutting down gracefully...`);
            server.close(() => {
                console.log("🛑 HTTP server closed");
                process.exit(0);
            });
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    }
    catch (error) {
        console.error("❌ Server start failed:", error);
        process.exit(1);
    }
};
startServer();
