import { Schema, model, Document } from "mongoose";

export type ActivityType =
  | "project_created"
  | "project_updated"
  | "blog_published"
  | "event_created"
  | "profile_updated";

export interface IActivity extends Document {
  userId: string;
  type: ActivityType;
  description?: string;
  projectId?: string;
  projectTitle?: string;
  blogId?: string;
  blogTitle?: string;
  eventId?: string;
  eventTitle?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, trim: true },
    projectId: { type: String, index: true },
    projectTitle: { type: String, trim: true },
    blogId: { type: String, index: true },
    blogTitle: { type: String, trim: true },
    eventId: { type: String, index: true },
    eventTitle: { type: String, trim: true },
    meta: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = model<IActivity>("Activity", activitySchema);