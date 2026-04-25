import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, secret) as { id?: string };
    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userExists = await User.exists({ _id: decoded.id });
    if (!userExists) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    (req as AuthRequest).userId = decoded.id;
    next();
  } catch (error) {
    console.error("Token verification failed", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

/**
 * Optional authentication middleware.
 * If a valid Bearer token is present, populates req.userId.
 * If no token or an invalid/expired token is provided, silently continues
 * without setting req.userId — the request is treated as a guest.
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret) as { id?: string };
    if (decoded?.id) {
      const userExists = await User.exists({ _id: decoded.id });
      if (userExists) {
        (req as AuthRequest).userId = decoded.id;
      }
    }
  } catch {
    // Invalid or expired token — treat as guest, do not reject
  }

  next();
};
