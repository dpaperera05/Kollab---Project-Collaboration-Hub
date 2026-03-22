import { Schema, model, Document } from "mongoose";

export type EventType = "Hackathon" | "Talk" | "Workshop" | "Webinar";

export interface IEvent extends Document {
  userId: string;
  title: string;
  coverImage?: string;
  type: EventType;
  dateTime: string;
  location: string;
  tags: string[];
  externalLink?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true },
    type: { type: String, enum: ["Hackathon", "Talk", "Workshop", "Webinar"], default: "Talk" },
    dateTime: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    externalLink: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Event = model<IEvent>("Event", eventSchema);
