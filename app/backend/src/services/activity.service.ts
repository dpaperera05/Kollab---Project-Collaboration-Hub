import { Activity, type ActivityType } from "../models/activity.model";

type ActivityPayload = {
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
};

export const recordActivity = async (payload: ActivityPayload) => {
  try {
    await Activity.create({
      ...payload,
      createdAt: new Date(),
    });
  } catch (err) {
    // Do not block main flows on activity logging failures
    console.error("Failed to record activity", err);
  }
};