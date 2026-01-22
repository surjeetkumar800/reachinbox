"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logoutUser = exports.googleCallbackSuccess = void 0;
/**
 * After successful Google login
 */
const googleCallbackSuccess = (req, res) => {
    res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
};
exports.googleCallbackSuccess = googleCallbackSuccess;
/**
 * Logout user
 */
const logoutUser = (req, res) => {
    req.logout(() => {
        res.clearCookie("connect.sid");
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    });
};
exports.logoutUser = logoutUser;
/**
 * Get current logged-in user
 */
const getCurrentUser = (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated",
        });
    }
    res.json({
        success: true,
        user: req.user,
    });
};
exports.getCurrentUser = getCurrentUser;
