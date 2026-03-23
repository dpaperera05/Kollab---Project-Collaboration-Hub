import { Schema, model, Document } from "mongoose";

export interface IBlog extends Document {
  userId: string;
  title: string;
  coverImage?: string;
  coverKey?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true },
    coverKey: { type: String, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Blog = model<IBlog>("Blog", blogSchema);
