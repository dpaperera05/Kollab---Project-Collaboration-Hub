import { Request, Response } from "express";
import mongoose from "mongoose";
import JobMarketJob from "../models/JobMarketJob";

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const CACHE_TTL_MS = Math.max(
  parseInt(process.env.JOB_MARKET_CACHE_TTL_MS || "60000", 10) || 60000,
  1000
);

let summaryCache: CacheEntry<Record<string, unknown>> | null = null;
let filtersCache: CacheEntry<Record<string, unknown>> | null = null;

const getCached = <T>(entry: CacheEntry<T> | null): T | null => {
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) return null;
  return entry.value;
};

const setCached = <T>(value: T): CacheEntry<T> => ({
  value,
  expiresAt: Date.now() + CACHE_TTL_MS,
});

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value !== "string") return undefined;

  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;

  return undefined;
};

export const getJobMarketJobs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 12, 1), 100);
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const roleCategory = (req.query.roleCategory as string)?.trim();
    const seniority = (req.query.seniority as string)?.trim();
    const workMode = (req.query.workMode as string)?.trim();
    const company = (req.query.company as string)?.trim();
    const country = (req.query.country as string)?.trim();
    const isTechJob = parseBoolean(req.query.isTechJob);

    const allowedSortFields = ["postedDate", "company", "title", "createdAt"];
    const requestedSortBy = (req.query.sortBy as string)?.trim() || "postedDate";
    const sortBy = allowedSortFields.includes(requestedSortBy)
      ? requestedSortBy
      : "postedDate";

    const sortOrder = (req.query.sortOrder as string)?.trim() === "asc" ? 1 : -1;

    const query: Record<string, any> = {};

    if (typeof isTechJob === "boolean") {
      query.isTechJob = isTechJob;
    }

    if (roleCategory) {
      query.roleCategory = roleCategory;
    }

    if (seniority) {
      query.seniority = seniority;
    }

    if (workMode) {
      query.workMode = workMode;
    }

    if (company) {
      query.company = { $regex: `^${company}$`, $options: "i" };
    }

    if (country) {
      query.country = country;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
        { technologies: { $regex: search, $options: "i" } },
      ];
    }

    const [total, jobs] = await Promise.all([
      JobMarketJob.countDocuments(query),
      JobMarketJob.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        search: search || null,
        roleCategory: roleCategory || null,
        seniority: seniority || null,
        workMode: workMode || null,
        company: company || null,
        country: country || null,
        isTechJob: typeof isTechJob === "boolean" ? isTechJob : null,
        sortBy,
        sortOrder: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching job market jobs:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job market jobs.",
    });
  }
};

export const getJobMarketJobById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;

    if (typeof idParam !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid job id.",
      });
    }

    const id = idParam;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id.",
      });
    }

    const job = await JobMarketJob.findById(id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job market job by id:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job market job.",
    });
  }
};

export const getJobMarketSummary = async (_req: Request, res: Response) => {
  try {
    const cached = getCached(summaryCache);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true });
    }

    const [summaryAgg] = await JobMarketJob.aggregate<{
      totals: { totalJobs: number; techJobs: number; nonTechJobs: number }[];
      roleCategoryCounts: { _id: string; count: number }[];
      seniorityCounts: { _id: string; count: number }[];
      topSkills: { _id: string; count: number }[];
      topTechnologies: { _id: string; count: number }[];
    }>([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalJobs: { $sum: 1 },
                techJobs: {
                  $sum: { $cond: [{ $eq: ["$isTechJob", true] }, 1, 0] },
                },
                nonTechJobs: {
                  $sum: { $cond: [{ $eq: ["$isTechJob", true] }, 0, 1] },
                },
              },
            },
          ],
          roleCategoryCounts: [
            {
              $match: {
                isTechJob: true,
                roleCategory: { $type: "string", $ne: "" },
              },
            },
            { $group: { _id: "$roleCategory", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          seniorityCounts: [
            {
              $match: {
                isTechJob: true,
                seniority: { $type: "string", $ne: "" },
              },
            },
            { $group: { _id: "$seniority", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          topSkills: [
            { $match: { isTechJob: true } },
            { $unwind: "$skills" },
            { $match: { skills: { $type: "string", $ne: "" } } },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          topTechnologies: [
            { $match: { isTechJob: true } },
            { $unwind: "$technologies" },
            { $match: { technologies: { $type: "string", $ne: "" } } },
            { $group: { _id: "$technologies", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    const totals = summaryAgg?.totals?.[0] || {
      totalJobs: 0,
      techJobs: 0,
      nonTechJobs: 0,
    };

    const roleCategoryCounts = Object.fromEntries(
      (summaryAgg?.roleCategoryCounts || []).map((item) => [item._id, item.count])
    );

    const seniorityCounts = Object.fromEntries(
      (summaryAgg?.seniorityCounts || []).map((item) => [item._id, item.count])
    );

    const topSkills = (summaryAgg?.topSkills || []).map((item) => ({
      name: item._id,
      count: item.count,
    }));

    const topTechnologies = (summaryAgg?.topTechnologies || []).map((item) => ({
      name: item._id,
      count: item.count,
    }));

    const payload = {
      totals,
      roleCategoryCounts,
      seniorityCounts,
      topSkills,
      topTechnologies,
    };

    summaryCache = setCached(payload);

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error("Error fetching job market summary:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job market summary.",
    });
  }
};

export const getJobMarketFilters = async (_req: Request, res: Response) => {
  try {
    const cached = getCached(filtersCache);
    if (cached) {
      return res.status(200).json({ success: true, data: cached, cached: true });
    }

    const [filtersAgg] = await JobMarketJob.aggregate<{
      roleCategories: { _id: string }[];
      seniorityLevels: { _id: string }[];
      workModes: { _id: string }[];
      topCompanies: { _id: string; count: number }[];
      topCountries: { _id: string; count: number }[];
    }>([
      { $match: { isTechJob: true } },
      {
        $facet: {
          roleCategories: [
            { $match: { roleCategory: { $type: "string", $ne: "" } } },
            { $group: { _id: "$roleCategory" } },
            { $sort: { _id: 1 } },
          ],
          seniorityLevels: [
            { $match: { seniority: { $type: "string", $ne: "" } } },
            { $group: { _id: "$seniority" } },
            { $sort: { _id: 1 } },
          ],
          workModes: [
            { $match: { workMode: { $type: "string", $ne: "" } } },
            { $group: { _id: "$workMode" } },
            { $sort: { _id: 1 } },
          ],
          topCompanies: [
            { $match: { company: { $type: "string", $ne: "" } } },
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 20 },
          ],
          topCountries: [
            { $match: { country: { $type: "string", $ne: "" } } },
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 20 },
          ],
        },
      },
    ]);

    const payload = {
      roleCategories: (filtersAgg?.roleCategories || []).map((item) => item._id),
      seniorityLevels: (filtersAgg?.seniorityLevels || []).map((item) => item._id),
      workModes: (filtersAgg?.workModes || []).map((item) => item._id),
      topCompanies: (filtersAgg?.topCompanies || []).map((item) => ({
        name: item._id,
        count: item.count,
      })),
      topCountries: (filtersAgg?.topCountries || []).map((item) => ({
        name: item._id,
        count: item.count,
      })),
    };

    filtersCache = setCached(payload);

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error("Error fetching job market filters:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job market filters.",
    });
  }
};