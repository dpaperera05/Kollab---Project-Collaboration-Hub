import { Request, Response } from "express";
import { NewsletterSubscription } from "../models/newsletter.model";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body || {};

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Please provide a valid email." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await NewsletterSubscription.updateOne(
      { email: normalizedEmail },
      { email: normalizedEmail },
      { upsert: true }
    );
    return res.status(201).json({ success: true, message: "Subscribed successfully." });
  } catch (err) {
    console.error("Failed to save newsletter subscription", err);
    return res.status(500).json({ success: false, message: "Unable to subscribe right now." });
  }
};
