import mongoose, { Document, Schema } from "mongoose";

export interface IJobMarketJob extends Document {
  source: string;
  sourceJobId: string;
  canonicalJobKey: string;
  title: string;
  normalizedTitle: string;
  company: string;
  normalizedCompany: string;
  locationText: string;
  country?: string;
  workMode?: string;
  employmentType?: string;
  description: string;
  jobUrl: string;
  postedDate?: string;

  roleCategory?: string;
  seniority?: string;
  isTechJob: boolean;

  skills: string[];
  technologies: string[];

  rawPayload: Record<string, unknown>;

  processedAt?: string;
  pipelineVersion: string;
  syncedAt?: string;
}

const JobMarketJobSchema = new Schema<IJobMarketJob>(
  {
    source: { type: String, required: true },
    sourceJobId: { type: String, required: true },
    canonicalJobKey: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    normalizedTitle: { type: String, required: true, index: true },
    company: { type: String, required: true },
    normalizedCompany: { type: String, required: true, index: true },
    locationText: { type: String, required: true },
    country: { type: String, default: null, index: true },
    workMode: { type: String, default: null, index: true },
    employmentType: { type: String, default: null },
    description: { type: String, default: "" },
    jobUrl: { type: String, required: true },
    postedDate: { type: String, default: null, index: true },

    roleCategory: { type: String, default: null, index: true },
    seniority: { type: String, default: null, index: true },
    isTechJob: { type: Boolean, required: true, index: true },

    skills: { type: [String], default: [] },
    technologies: { type: [String], default: [] },

    rawPayload: { type: Schema.Types.Mixed, default: {} },

    processedAt: { type: String, default: null },
    pipelineVersion: { type: String, default: "v1" },
    syncedAt: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: "job_market_jobs",
  }
);

export default mongoose.model<IJobMarketJob>("JobMarketJob", JobMarketJobSchema);