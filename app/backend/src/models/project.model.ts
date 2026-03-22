import { Schema, model, Document } from "mongoose";

export type ProjectStatus = "Open" | "Ongoing" | "Filled" | "Finished";
export type ApplicantStatus = "pending" | "approved" | "rejected";

export interface IProjectApplicant {
  id: string;
  userId?: string;
  name: string;
  role: string;
  motivation?: string;
  links?: { github?: string; linkedin?: string };
  status: ApplicantStatus;
  rejectionReason?: string;
}

export interface IProject extends Document {
  ownerId: string;
  title: string;
  status: ProjectStatus;
  roles: string[];
  postedAt: string;
  applicants: IProjectApplicant[];
  members: { userId: string; role: string; status: ProjectStatus }[];
  createdAt: Date;
  updatedAt: Date;
}

const applicantSchema = new Schema<IProjectApplicant>(
  {
    id: { type: String, required: true },
    userId: { type: String, ref: "User" },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    motivation: { type: String, trim: true },
    links: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    ownerId: { type: String, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Open", "Ongoing", "Filled", "Finished"], default: "Open" },
    roles: [{ type: String, trim: true }],
    postedAt: { type: String, default: () => new Date().toISOString() },
    applicants: [applicantSchema],
    members: [
      {
        userId: { type: String, ref: "User" },
        role: { type: String, trim: true },
        status: { type: String, enum: ["Open", "Ongoing", "Filled", "Finished"] },
      },
    ],
  },
  { timestamps: true }
);

export const Project = model<IProject>("Project", projectSchema);
