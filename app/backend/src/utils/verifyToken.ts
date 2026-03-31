import jwt from "jsonwebtoken";
import { OTP_EXPIRY_MINUTES } from "./otp";

const OTP_TOKEN_SECRET = process.env.OTP_TOKEN_SECRET || process.env.JWT_SECRET;

if (!OTP_TOKEN_SECRET) {
  console.warn("OTP token secret is not set. Set OTP_TOKEN_SECRET or JWT_SECRET.");
}

interface VerificationPayload {
  email: string;
  code: string;
  purpose?: "verify" | "reset";
}

export const issueVerificationToken = (payload: VerificationPayload): string => {
  if (!OTP_TOKEN_SECRET) {
    throw new Error("OTP token secret is not configured");
  }
  return jwt.sign(payload, OTP_TOKEN_SECRET, { expiresIn: `${OTP_EXPIRY_MINUTES}m` });
};

export const verifyVerificationToken = (token: string): VerificationPayload | null => {
  if (!OTP_TOKEN_SECRET) return null;
  try {
    const decoded = jwt.verify(token, OTP_TOKEN_SECRET) as VerificationPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
