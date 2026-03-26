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

  const user = await User.findOne({ email });
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const derivedName = name?.trim() || email.split("@")[0];

    const user = await User.create({
      name: derivedName,
      email,
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
      const verificationToken = issueVerificationToken({ email: user.email, code });

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

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const payload = verifyVerificationToken(verificationToken);

  if (!payload || payload.email !== user.email) {
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
