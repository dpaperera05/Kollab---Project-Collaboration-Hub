import { Schema, model, Document } from "mongoose";

export interface IVerificationToken extends Document {
  userId: string;
  code: string;
  expiresAt: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: "0s" } },
  },
  { timestamps: true }
);

export const VerificationToken = model<IVerificationToken>("VerificationToken", verificationTokenSchema);
