import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  userType: "member" | "mentor";
  isEmailVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, enum: ["member", "mentor"] },
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
