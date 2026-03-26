import { Schema, model, Document } from "mongoose";

export type EventType = "Hackathon" | "Talk" | "Workshop" | "Webinar";
export type EventLocationType = "Virtual" | "City";

export interface IEvent extends Document {
  userId: string;
  title: string;
  coverImage?: string;
  coverKey?: string;
  type: EventType;
  dateTime: string;
  endDateTime?: string;
  timezone?: string;
  locationType: EventLocationType;
  city?: string;
  virtualPlatform?: string;
  tags: string[];
  externalLink?: string;
  description?: string;
  featured?: boolean;
  organizer?: string;
  prize?: string;
  participantCount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true },
    coverKey: { type: String, trim: true },
    type: { type: String, enum: ["Hackathon", "Talk", "Workshop", "Webinar"], default: "Talk" },
    dateTime: { type: String, required: true },
    endDateTime: { type: String },
    timezone: { type: String, trim: true },
    locationType: { type: String, enum: ["Virtual", "City"], required: true },
    city: { type: String, trim: true },
    virtualPlatform: { type: String, trim: true },
    tags: [{ type: String, trim: true, index: true }],
    externalLink: { type: String, trim: true },
    description: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    organizer: { type: String, trim: true },
    prize: { type: String, trim: true },
    participantCount: { type: Number },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Event = model<IEvent>("Event", eventSchema);
