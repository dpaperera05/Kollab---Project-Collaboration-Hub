import { Schema, model, Document } from "mongoose";

export interface IPortfolioItem extends Document {
  userId: string;
  title: string;
  role?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  responsibilities?: string;
  outcomes?: string;
  techStack?: string[];
  links?: { label?: string; url: string }[];
  collaborators?: string[];
  screenshots?: string[];
  coverImage?: string;
  specialNotes?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new Schema<IPortfolioItem>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    summary: { type: String, trim: true },
    problem: { type: String, trim: true },
    solution: { type: String, trim: true },
    responsibilities: { type: String, trim: true },
    outcomes: { type: String, trim: true },
    techStack: [{ type: String, trim: true }],
    links: [
      {
        label: { type: String, trim: true },
        url: { type: String, trim: true, required: true },
      },
    ],
    collaborators: [{ type: String, trim: true }],
    screenshots: [{ type: String, trim: true }],
    coverImage: { type: String, trim: true },
    specialNotes: { type: String, trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

portfolioSchema.index({ userId: 1, isPublished: 1, createdAt: -1 });
portfolioSchema.index({ userId: 1, isPublished: 1 });

export const PortfolioItem = model<IPortfolioItem>("PortfolioItem", portfolioSchema);
