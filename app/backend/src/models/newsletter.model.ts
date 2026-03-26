import { Schema, model, Document } from "mongoose";

export interface INewsletterSubscription extends Document {
  email: string;
  createdAt: Date;
}

const newsletterSchema = new Schema<INewsletterSubscription>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const NewsletterSubscription = model<INewsletterSubscription>("NewsletterSubscription", newsletterSchema);
