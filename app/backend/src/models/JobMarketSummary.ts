import mongoose, { Document, Schema } from "mongoose";

interface ITopItem {
  name: string;
  count: number;
}

export interface IJobMarketSummary extends Document {
  pipelineVersion: string;
  generatedAt: string;
  totals: {
    rawJobs: number;
    uniqueJobs: number;
    duplicatesRemoved: number;
    techJobs: number;
    nonTechJobs: number;
  };
  roleCategoryCounts: Record<string, number>;
  seniorityCounts: Record<string, number>;
  topSkills: ITopItem[];
  topTechnologies: ITopItem[];
}

const TopItemSchema = new Schema<ITopItem>(
  {
    name: { type: String, required: true },
    count: { type: Number, required: true },
  },
  { _id: false }
);

const JobMarketSummarySchema = new Schema<IJobMarketSummary>(
  {
    pipelineVersion: { type: String, default: "v1" },
    generatedAt: { type: String, required: true, index: true },
    totals: {
      rawJobs: { type: Number, required: true },
      uniqueJobs: { type: Number, required: true },
      duplicatesRemoved: { type: Number, required: true },
      techJobs: { type: Number, required: true },
      nonTechJobs: { type: Number, required: true },
    },
    roleCategoryCounts: { type: Schema.Types.Mixed, default: {} },
    seniorityCounts: { type: Schema.Types.Mixed, default: {} },
    topSkills: { type: [TopItemSchema], default: [] },
    topTechnologies: { type: [TopItemSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "job_market_summary",
  }
);

export default mongoose.model<IJobMarketSummary>(
  "JobMarketSummary",
  JobMarketSummarySchema
);