import { Schema, model, Document } from "mongoose";

export type ProjectStatus = "Open" | "Ongoing" | "Filled" | "Finished";
export type ApplicantStatus = "pending" | "approved" | "rejected";

export interface IProjectRole {
  id: string;
  title: string;
  responsibilities: string[];
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  level: "Junior" | "Intermediate" | "Senior";
  seats: number;
  status: "Open" | "Filled";
}

export interface IProjectApplicant {
  id: string;
  userId?: string;
  name: string;
  role: string;
  motivation?: string;
  links?: { github?: string; linkedin?: string };
  evidenceLinks?: string[];
  resumeUrl?: string;
  resumeKey?: string;
  resumeName?: string;
  status: ApplicantStatus;
  rejectionReason?: string;
}

export interface IProject extends Document {
  ownerId: string;
  title: string;
  summary: string;
  problemStatement?: string;
  deliverables: string[];
  projectType: string;
  domain: string;
  technologies: string[];
  difficulty: string;
  duration: string;
  weeklyHours: number;
  compensation: string;
  posterImage?: string;
  posterKey?: string;
  tags: string[];
  status: ProjectStatus;
  roles: IProjectRole[];
  postedAt: string;
  applicants: IProjectApplicant[];
  members: { userId: string; role: string; status: ProjectStatus }[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IProjectRole>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    responsibilities: [{ type: String, trim: true }],
    requiredSkills: [{ type: String, trim: true }],
    niceToHaveSkills: [{ type: String, trim: true }],
    level: { type: String, enum: ["Junior", "Intermediate", "Senior"], required: true },
    seats: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["Open", "Filled"], default: "Open" },
  },
  { _id: false }
);

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
    evidenceLinks: [{ type: String, trim: true }],
    resumeUrl: { type: String, trim: true },
    resumeKey: { type: String, trim: true },
    resumeName: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    ownerId: { type: String, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    problemStatement: { type: String, trim: true },
    deliverables: [{ type: String, trim: true }],
    projectType: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true, index: true },
    technologies: [{ type: String, trim: true, index: true }],
    difficulty: { type: String, required: true, trim: true, index: true },
    duration: { type: String, required: true, trim: true },
    weeklyHours: { type: Number, required: true, min: 1, max: 80 },
    compensation: { type: String, required: true, trim: true },
    posterImage: { type: String, trim: true },
    tags: [{ type: String, trim: true, index: true }],
    status: { type: String, enum: ["Open", "Ongoing", "Filled", "Finished"], default: "Open", index: true },
    roles: [roleSchema],
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
