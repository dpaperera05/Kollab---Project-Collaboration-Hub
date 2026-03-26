import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { generateToken } from "../utils/token";
import { generateOtp, OTP_EXPIRY_MINUTES } from "../utils/otp";
import { sendEmail } from "../services/email.service";
import { issueVerificationToken, verifyVerificationToken } from "../utils/verifyToken";
import { toUserResponse } from "../utils/userResponse";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({ success: false, message: "Please verify your email before logging in" });
  }

  if (!user.onboardingCompleted && !user.onboardingStep) {
    user.onboardingStep = "/onboarding/role";
    await user.save();
  }

  const token = generateToken(user.id);

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: toUserResponse(user),
      token,
    },
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, userType } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    userType?: "member" | "mentor";
  };

  try {
    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, message: "Email, password, and user type are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const derivedName = name?.trim() || normalizedEmail.split("@")[0];

    const user = await User.create({
      name: derivedName,
      email: normalizedEmail,
      password: hashedPassword,
      userType,
      onboardingStep: "/onboarding/role",
      profile: { name: derivedName },
    });

    const emailEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && (process.env.SMTP_FROM || process.env.SMTP_USER));

    // If email is not configured, auto-verify to unblock local/dev usage
    if (!emailEnabled) {
      user.isEmailVerified = true;
      await user.save();
      const token = generateToken(user.id);
      return res.status(201).json({
        success: true,
        message: "User registered (email verification skipped — SMTP not configured)",
        data: { user: toUserResponse(user), token, verificationToken: null },
      });
    }

    try {
      // create OTP (not stored server-side; encoded into a short-lived token returned to client)
      const code = generateOtp();
      const verificationToken = issueVerificationToken({ email: user.email, code, purpose: "verify" });

      const subject = "Verify your Kollab account";
      const text = `Your verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;
      const html = `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`;
      await sendEmail(user.email, subject, text, html);

      const token = generateToken(user.id);

      return res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your email.",
        data: {
          user: toUserResponse(user),
          token,
          verificationToken,
        },
      });
    } catch (emailError) {
      // cleanup the created user so repeated attempts don't hit 409
      await User.findByIdAndDelete(user.id).catch(() => undefined);
      console.error("Error sending verification email:", emailError);
      return res.status(500).json({ success: false, message: "Failed to send verification email. Please try again." });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ success: false, message: "Failed to register user" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code, verificationToken } = req.body as { email?: string; code?: string; verificationToken?: string };

  if (!email || !code || !verificationToken) {
    return res.status(400).json({ success: false, message: "Email, code, and verification token are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const payload = verifyVerificationToken(verificationToken);

  if (!payload || payload.email !== user.email || payload.purpose !== "verify") {
    return res.status(400).json({ success: false, message: "Invalid verification token" });
  }

  if (payload.code !== code) {
    return res.status(400).json({ success: false, message: "Invalid code" });
  }

  user.isEmailVerified = true;
  await user.save();

  return res.json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: toUserResponse(user),
    },
  });
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const code = generateOtp();
  const resetToken = issueVerificationToken({ email: user.email, code, purpose: "reset" });
  const emailEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && (process.env.SMTP_FROM || process.env.SMTP_USER));

  const subject = "Reset your Kollab password";
  const text = `Your password reset code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;
  const html = `<p>Your password reset code is <strong>${code}</strong>.</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`;

  if (!emailEnabled) {
    return res.json({
      success: true,
      message: "Password reset requested (email not configured). Use the code from the response in dev only.",
      data: { resetToken, code },
    });
  }

  try {
    await sendEmail(user.email, subject, text, html);
    return res.json({ success: true, message: "Password reset code sent", data: { resetToken } });
  } catch (error) {
    console.error("Error sending reset email:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset email" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, resetToken, newPassword } = req.body as {
    email?: string;
    code?: string;
    resetToken?: string;
    newPassword?: string;
  };

  if (!email || !code || !resetToken || !newPassword) {
    return res.status(400).json({ success: false, message: "Email, code, resetToken, and newPassword are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const payload = verifyVerificationToken(resetToken);

  if (!payload || payload.email !== user.email || payload.code !== code || payload.purpose !== "reset") {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return res.json({ success: true, message: "Password reset successful" });
};
