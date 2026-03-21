import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { generateToken } from "../utils/token";

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

    const user = await User.create({ name: derivedName, email, password: hashedPassword, userType });

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ success: false, message: "Failed to register user" });
  }
};
