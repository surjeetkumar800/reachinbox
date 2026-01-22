import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";

import emailRoutes from "./routes/email.routes";
import authRoutes from "./routes/auth.routes";
import "./config/passport"; // passport strategies init

const app = express();

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
  app.use(morgan("dev"));
}

/* ---- CORS ---- */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

/* ---- Body parsers ---- */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   SESSION CONFIG
====================================================== */
app.use(
  session({
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
  }),
);

/* ======================================================
   PASSPORT
====================================================== */
app.use(passport.initialize());
app.use(passport.session());

/* ======================================================
   HEALTH CHECK
====================================================== */
app.get("/", (_req: Request, res: Response) => {
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
app.use("/api/auth", authRoutes);
app.use("/api/emails", emailRoutes);

/* ======================================================
   404 HANDLER
====================================================== */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Global Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
