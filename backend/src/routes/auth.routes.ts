import { Router } from "express";
import passport from "passport";
import {
  googleCallbackSuccess,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller";

const router = Router();

/**
 * Redirect to Google
 * GET /api/auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * Google callback
 * GET /api/auth/google/callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  googleCallbackSuccess
);

/**
 * Logout
 * GET /api/auth/logout
 */
router.get("/logout", logoutUser);

/**
 * Get logged-in user
 * GET /api/auth/me
 */
router.get("/me", getCurrentUser);

export default router;
