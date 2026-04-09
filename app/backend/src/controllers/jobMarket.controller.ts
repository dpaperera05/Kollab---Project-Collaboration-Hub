import { Request, Response } from "express";
import mongoose from "mongoose";
import JobMarketJob from "../models/JobMarketJob";

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

    const total = await JobMarketJob.countDocuments(query);

    const jobs = await JobMarketJob.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

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
    const { id } = req.params;

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
    const jobs = await JobMarketJob.find().lean();

    const totalJobs = jobs.length;
    const techJobs = jobs.filter((job) => job.isTechJob);
    const nonTechJobs = jobs.filter((job) => !job.isTechJob);

    const roleCategoryCounts: Record<string, number> = {};
    const seniorityCounts: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};
    const technologyCounts: Record<string, number> = {};

    for (const job of techJobs) {
      if (job.roleCategory) {
        roleCategoryCounts[job.roleCategory] =
          (roleCategoryCounts[job.roleCategory] || 0) + 1;
      }

      if (job.seniority) {
        seniorityCounts[job.seniority] =
          (seniorityCounts[job.seniority] || 0) + 1;
      }

      for (const skill of job.skills || []) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }

      for (const technology of job.technologies || []) {
        technologyCounts[technology] = (technologyCounts[technology] || 0) + 1;
      }
    }

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topTechnologies = Object.entries(technologyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return res.status(200).json({
      success: true,
      data: {
        totals: {
          totalJobs,
          techJobs: techJobs.length,
          nonTechJobs: nonTechJobs.length,
        },
        roleCategoryCounts,
        seniorityCounts,
        topSkills,
        topTechnologies,
      },
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
    const jobs = await JobMarketJob.find({ isTechJob: true }).lean();

    const roleCategorySet = new Set<string>();
    const senioritySet = new Set<string>();
    const workModeSet = new Set<string>();

    const companyCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    for (const job of jobs) {
      if (job.roleCategory) {
        roleCategorySet.add(job.roleCategory);
      }

      if (job.seniority) {
        senioritySet.add(job.seniority);
      }

      if (job.workMode) {
        workModeSet.add(job.workMode);
      }

      if (job.company) {
        companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
      }

      if (job.country) {
        countryCounts[job.country] = (countryCounts[job.country] || 0) + 1;
      }
    }

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    return res.status(200).json({
      success: true,
      data: {
        roleCategories: Array.from(roleCategorySet).sort(),
        seniorityLevels: Array.from(senioritySet).sort(),
        workModes: Array.from(workModeSet).sort(),
        topCompanies,
        topCountries,
      },
    });
  } catch (error) {
    console.error("Error fetching job market filters:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job market filters.",
    });
  }
};