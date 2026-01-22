"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const morgan_1 = __importDefault(require("morgan"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
require("./config/passport"); // passport strategies init
const app = (0, express_1.default)();
/* ======================================================
   GLOBAL CONFIG
====================================================== */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const SESSION_SECRET = process.env.SESSION_SECRET || "CHANGE_ME_IN_PROD";
const NODE_ENV = process.env.NODE_ENV || "development";
/* ======================================================
   MIDDLEWARES
====================================================== */
/* ---- Logging (prod safe) ---- */
if (NODE_ENV !== "test") {
    app.use((0, morgan_1.default)("dev"));
}
/* ---- CORS ---- */
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
/* ---- Body parsers ---- */
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
/* ======================================================
   SESSION CONFIG
====================================================== */
app.use((0, express_session_1.default)({
    name: "reachinbox.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: NODE_ENV === "production", // https only in prod
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));
/* ======================================================
   PASSPORT
====================================================== */
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        service: "ReachInbox Backend",
        status: "running",
        timestamp: new Date().toISOString(),
    });
});
/* ======================================================
   ROUTES
====================================================== */
app.use("/api/auth", auth_routes_1.default);
app.use("/api/emails", email_routes_1.default);
/* ======================================================
   404 HANDLER
====================================================== */
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});
/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
app.use((err, _req, res, _next) => {
    console.error("🔥 Global Error:", err.message);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});
exports.default = app;
