"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
/**
 * Redirect to Google
 * GET /api/auth/google
 */
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
/**
 * Google callback
 * GET /api/auth/google/callback
 */
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "/login",
    session: true,
}), auth_controller_1.googleCallbackSuccess);
/**
 * Logout
 * GET /api/auth/logout
 */
router.get("/logout", auth_controller_1.logoutUser);
/**
 * Get logged-in user
 * GET /api/auth/me
 */
router.get("/me", auth_controller_1.getCurrentUser);
exports.default = router;
