import { Request, Response } from "express";

/**
 * After successful Google login
 */
export const googleCallbackSuccess = (req: Request, res: Response) => {
  res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
};

/**
 * Logout user
 */
export const logoutUser = (req: Request, res: Response) => {
  req.logout(() => {
    res.clearCookie("connect.sid");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = (req: Request, res: Response) => {
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
