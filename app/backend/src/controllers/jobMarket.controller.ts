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

const ALLOWED_TIME_RANGES = ["24h", "7d", "30d"] as const;
type TimeRange = (typeof ALLOWED_TIME_RANGES)[number];

const getTimeRangeWindowStart = (timeRange: TimeRange): Date => {
  const now = Date.now();

  if (timeRange === "24h") {
    return new Date(now - 24 * 60 * 60 * 1000);
  }

  if (timeRange === "7d") {
    return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(now - 30 * 24 * 60 * 60 * 1000);
};

const hasTextValue = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const asArrayCountDistribution = (
  input: Array<{ _id: string; count: number }> | undefined
): Array<{ key: string; count: number }> =>
  (input || [])
    .filter((item) => hasTextValue(item._id) && Number.isFinite(item.count) && item.count > 0)
    .map((item) => ({ key: item._id, count: item.count }));

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
    const postedDateFrom = (req.query.postedDateFrom as string)?.trim();

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

    if (postedDateFrom) {
      // postedDate is stored as an ISO string — lexicographic comparison works correctly for ISO 8601 dates
      query.postedDate = { $gte: postedDateFrom };
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
        postedDateFrom: postedDateFrom || null,
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
            {
              $match: {
                workMode: {
                  $type: "string",
                  $ne: "",
                  $not: /^(unknown|n\/a|null|undefined)$/i,
                },
              },
            },
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
      workModes: (filtersAgg?.workModes || [])
        .map((item) => item._id)
        .filter((v) => !/^(unknown|n\/a|null|undefined)$/i.test(v.trim())),
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

export const getJobMarketInsights = async (req: Request, res: Response) => {
  try {
    const requestedTimeRange = typeof req.query.timeRange === "string" ? req.query.timeRange.trim() : "";
    const timeRange: TimeRange = (requestedTimeRange || "30d") as TimeRange;

    if (!ALLOWED_TIME_RANGES.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timeRange. Allowed values: 24h, 7d, 30d.",
      });
    }

    const country = typeof req.query.country === "string" ? req.query.country.trim() : "";
    const roleCategory = typeof req.query.roleCategory === "string" ? req.query.roleCategory.trim() : "";
    const seniority = typeof req.query.seniority === "string" ? req.query.seniority.trim() : "";
    const workMode = typeof req.query.workMode === "string" ? req.query.workMode.trim() : "";
    const techOnly = parseBoolean(req.query.techOnly);

    const windowStart = getTimeRangeWindowStart(timeRange);

    const baseMatch: Record<string, unknown> = {};

    if (country) baseMatch.country = country;
    if (roleCategory) baseMatch.roleCategory = roleCategory;
    if (seniority) baseMatch.seniority = seniority;
    if (workMode) baseMatch.workMode = workMode;
    if (techOnly === true) baseMatch.isTechJob = true;

    const [insightsAgg] = await JobMarketJob.aggregate<{
      totals: { jobsAnalyzed: number }[];
      topRole: { _id: string; count: number }[];
      topSeniority: { _id: string; count: number }[];
      topMentionedSkillOrTech: { _id: string; count: number }[];
      remoteStats: { remoteCount: number; knownCount: number }[];
      roleCategories: { _id: string; count: number }[];
      seniorityDistribution: { _id: string; count: number }[];
      skillsDistribution: { _id: string; count: number }[];
      technologiesDistribution: { _id: string; count: number }[];
      workModesDistribution: { _id: string; count: number }[];
      featuredJobs: Array<{
        _id: mongoose.Types.ObjectId;
        title: string;
        company: string;
        country: string;
        workMode: string;
        seniority: string;
        roleCategory: string;
        postedDate: string | null;
        description: string;
        jobUrl: string;
      }>;
      lastUpdated: { _id: null; value: Date | null }[];
    }>([
      {
        $addFields: {
          postedDateParsed: {
            $dateFromString: {
              dateString: "$postedDate",
              onError: null,
              onNull: null,
            },
          },
          processedAtParsed: {
            $dateFromString: {
              dateString: "$processedAt",
              onError: null,
              onNull: null,
            },
          },
          syncedAtParsed: {
            $dateFromString: {
              dateString: "$syncedAt",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          ...baseMatch,
          postedDateParsed: {
            $ne: null,
            $gte: windowStart,
          },
        },
      },
      {
        $facet: {
          totals: [{ $count: "jobsAnalyzed" }],
          topRole: [
            { $match: { roleCategory: { $type: "string", $ne: "" } } },
            { $group: { _id: "$roleCategory", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 1 },
          ],
          topSeniority: [
            { $match: { seniority: { $type: "string", $ne: "" } } },
            { $group: { _id: "$seniority", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 1 },
          ],
          topMentionedSkillOrTech: [
            {
              $project: {
                mergedMentions: {
                  $concatArrays: [{ $ifNull: ["$skills", []] }, { $ifNull: ["$technologies", []] }],
                },
              },
            },
            { $unwind: "$mergedMentions" },
            {
              $set: {
                mergedMentions: {
                  $trim: {
                    input: { $toString: "$mergedMentions" },
                  },
                },
              },
            },
            { $match: { mergedMentions: { $ne: "" } } },
            { $group: { _id: "$mergedMentions", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 1 },
          ],
          remoteStats: [
            { $match: { workMode: { $type: "string", $ne: "" } } },
            {
              $group: {
                _id: null,
                knownCount: { $sum: 1 },
                remoteCount: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          {
                            $toLower: {
                              $trim: {
                                input: "$workMode",
                              },
                            },
                          },
                          "remote",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          roleCategories: [
            { $match: { roleCategory: { $type: "string", $ne: "" } } },
            { $group: { _id: "$roleCategory", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
          seniorityDistribution: [
            { $match: { seniority: { $type: "string", $ne: "" } } },
            { $group: { _id: "$seniority", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
          skillsDistribution: [
            { $unwind: "$skills" },
            {
              $set: {
                skills: {
                  $trim: {
                    input: { $toString: "$skills" },
                  },
                },
              },
            },
            { $match: { skills: { $ne: "" } } },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
          technologiesDistribution: [
            { $unwind: "$technologies" },
            {
              $set: {
                technologies: {
                  $trim: {
                    input: { $toString: "$technologies" },
                  },
                },
              },
            },
            { $match: { technologies: { $ne: "" } } },
            { $group: { _id: "$technologies", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
          workModesDistribution: [
            { $match: { workMode: { $type: "string", $ne: "" } } },
            { $group: { _id: "$workMode", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
          ],
          featuredJobs: [
            { $sort: { postedDateParsed: -1 } },
            { $limit: 6 },
            {
              $project: {
                _id: 1,
                title: 1,
                company: 1,
                country: 1,
                workMode: 1,
                seniority: 1,
                roleCategory: 1,
                postedDate: {
                  $ifNull: ["$postedDate", null],
                },
                description: {
                  $ifNull: ["$description", ""],
                },
                jobUrl: 1,
              },
            },
          ],
          lastUpdated: [
            {
              $set: {
                bestUpdatedAt: {
                  $max: ["$processedAtParsed", "$syncedAtParsed"],
                },
              },
            },
            {
              $group: {
                _id: null,
                value: { $max: "$bestUpdatedAt" },
              },
            },
          ],
        },
      },
    ]);

    const jobsAnalyzed = insightsAgg?.totals?.[0]?.jobsAnalyzed || 0;
    const mostDemandedRole = insightsAgg?.topRole?.[0]?._id || null;
    const mostCommonSeniority = insightsAgg?.topSeniority?.[0]?._id || null;
    const mostMentionedSkillOrTech = insightsAgg?.topMentionedSkillOrTech?.[0]?._id || null;

    const knownWorkModes = insightsAgg?.remoteStats?.[0]?.knownCount || 0;
    const remoteCount = insightsAgg?.remoteStats?.[0]?.remoteCount || 0;
    const remoteShare =
      knownWorkModes > 0 ? Number(((remoteCount / knownWorkModes) * 100).toFixed(2)) : null;

    const lastUpdatedDate = insightsAgg?.lastUpdated?.[0]?.value || null;

    const appliedFilters: {
      timeRange: TimeRange;
      country?: string;
      roleCategory?: string;
      seniority?: string;
      workMode?: string;
      techOnly?: boolean;
    } = { timeRange };

    if (country) appliedFilters.country = country;
    if (roleCategory) appliedFilters.roleCategory = roleCategory;
    if (seniority) appliedFilters.seniority = seniority;
    if (workMode) appliedFilters.workMode = workMode;
    if (techOnly === true) appliedFilters.techOnly = true;

    return res.status(200).json({
      success: true,
      data: {
        lastUpdated: lastUpdatedDate ? new Date(lastUpdatedDate).toISOString() : null,
        appliedFilters,
        jobsAnalyzed,
        kpis: {
          mostDemandedRole,
          mostCommonSeniority,
          remoteShare,
          mostMentionedSkillOrTech,
        },
        distributions: {
          roleCategories: asArrayCountDistribution(insightsAgg?.roleCategories),
          seniority: asArrayCountDistribution(insightsAgg?.seniorityDistribution),
          skills: asArrayCountDistribution(insightsAgg?.skillsDistribution),
          technologies: asArrayCountDistribution(insightsAgg?.technologiesDistribution),
          workModes: asArrayCountDistribution(insightsAgg?.workModesDistribution),
        },
        featuredJobs: (insightsAgg?.featuredJobs || []).map((job) => ({
          _id: String(job._id),
          title: job.title || "",
          company: job.company || "",
          country: job.country || "",
          workMode: job.workMode || "",
          seniority: job.seniority || "",
          roleCategory: job.roleCategory || "",
          postedDate: job.postedDate || null,
          description: job.description || "",
          jobUrl: job.jobUrl || "",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching job market insights:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job market insights.",
    });
  }
};

/**
 * GET /api/job-market/role-distribution
 * Returns per-category job counts for ALL matching jobs via a server-side $group aggregation.
 * This is the correct way to power the bar chart — paginating through job pages would only
 * sample the most-recent N jobs, producing biased counts when filters are changed.
 */
export const getRoleDistribution = async (req: Request, res: Response) => {
  try {
    const seniority = (req.query.seniority as string)?.trim();
    const workMode = (req.query.workMode as string)?.trim();
    const country = (req.query.country as string)?.trim();
    const postedDateFrom = (req.query.postedDateFrom as string)?.trim();

    const match: Record<string, unknown> = {
      isTechJob: true,
      roleCategory: { $type: "string", $ne: "" },
    };

    if (seniority) match.seniority = seniority;
    if (workMode) match.workMode = workMode;
    if (country) match.country = country;
    if (postedDateFrom) {
      // postedDate is stored as an ISO string; lexicographic comparison is valid for ISO 8601
      match.postedDate = { $gte: postedDateFrom };
    }

    const distribution = await JobMarketJob.aggregate<{ _id: string; count: number }>([
      { $match: match },
      { $group: { _id: "$roleCategory", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: distribution.map((item) => ({ name: item._id, count: item.count })),
    });
  } catch (error) {
    console.error("Error fetching role distribution:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch role distribution.",
    });
  }
};

export const getCompaniesRepresented = async (_req: Request, res: Response) => {
  try {
    const results = await JobMarketJob.aggregate<{ _id: string; source: string; latestDate: string }>([
      {
        $match: {
          company: { $type: "string", $ne: "" },
          normalizedCompany: { $not: /^(unknown|n\/a|null|undefined|remote)$/i },
        },
      },
      {
        $group: {
          _id: "$company",
          source: { $first: "$source" },
          latestDate: { $max: "$postedDate" },
        },
      },
      { $sort: { latestDate: -1, _id: 1 } },
      { $limit: 12 },
    ]);

    return res.status(200).json({
      success: true,
      data: results.map((item) => ({
        name: item._id,
        normalizedName: item._id.toLowerCase().replace(/[^a-z0-9]/g, ""),
        source: item.source || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching companies represented:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies represented.",
    });
  }
};