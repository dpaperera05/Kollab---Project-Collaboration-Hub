import { mockJobs, mockSummary, mockFilters, type Job, type JobSummary, type JobFilters } from "@/data/mockJobMarket";
import { excerptText, stripHtml } from "@/lib/utils";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") || "http://localhost:5000";
const JOB_MARKET_BASE_PATH = "/api/job-market";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type JobsApiItem = Record<string, unknown>;

const toCountEntries = (input: unknown): { name: string; count: number }[] => {
  if (Array.isArray(input)) {
    return input
      .map((item) => {
        const entry = item as { name?: unknown; count?: unknown };
        if (typeof entry.name !== "string" || typeof entry.count !== "number") return null;
        return { name: entry.name, count: entry.count };
      })
      .filter((v): v is { name: string; count: number } => v !== null);
  }

  if (input && typeof input === "object") {
    return Object.entries(input as Record<string, unknown>)
      .map(([name, count]) => ({ name, count: typeof count === "number" ? count : 0 }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  return [];
};

const asStringArray = (input: unknown): string[] => {
  if (!Array.isArray(input)) return [];
  return input.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const normalizeJob = (raw: JobsApiItem): Job => {
  const rawDescription = typeof raw.description === "string" ? raw.description : "";
  const cleanedDescription = stripHtml(rawDescription) || "No description available.";

  const id = typeof raw.id === "string"
    ? raw.id
    : typeof raw._id === "string"
      ? raw._id
      : typeof raw.canonicalJobKey === "string"
        ? raw.canonicalJobKey
        : "";

  const city = typeof raw.city === "string" ? raw.city : "";
  const country = typeof raw.country === "string" ? raw.country : "";
  const location = typeof raw.location === "string"
    ? raw.location
    : [city, country].filter(Boolean).join(", ") || country || "Remote";

  return {
    id,
    title: typeof raw.title === "string" ? raw.title : "Untitled role",
    company: typeof raw.company === "string" ? raw.company : "Unknown company",
    companyLogo: typeof raw.companyLogo === "string" ? raw.companyLogo : undefined,
    location,
    country: country || "Unknown",
    workMode: (typeof raw.workMode === "string" ? raw.workMode : "Remote") as Job["workMode"],
    employmentType: (typeof raw.employmentType === "string" ? raw.employmentType : "Full-time") as Job["employmentType"],
    seniority: (typeof raw.seniority === "string" ? raw.seniority : "Mid") as Job["seniority"],
    roleCategory: typeof raw.roleCategory === "string" ? raw.roleCategory : "General",
    isTechJob: typeof raw.isTechJob === "boolean" ? raw.isTechJob : false,
    skills: asStringArray(raw.skills),
    technologies: asStringArray(raw.technologies),
    shortDescription: typeof raw.shortDescription === "string"
      ? excerptText(stripHtml(raw.shortDescription), 180)
      : excerptText(cleanedDescription, 180),
    description: cleanedDescription,
    postedDate: typeof raw.postedDate === "string"
      ? raw.postedDate
      : typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
    applyUrl: typeof raw.applyUrl === "string" ? raw.applyUrl : "#",
  };
};

const buildUrl = (path: string, query?: Record<string, unknown>) => {
  const base = `${API_BASE_URL}${JOB_MARKET_BASE_PATH}${path}`;
  if (!query) return base;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
};

const requestJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
};

const withMockFallback = async <T>(operation: () => Promise<T>, fallback: () => T): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error("Job market API failed. Falling back to mock data.", error);
    return fallback();
  }
};

export interface GetJobMarketJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  roleCategory?: string;
  seniority?: string;
  workMode?: string;
  isTechJob?: boolean;
  company?: string;
  country?: string;
  postedDateFrom?: string;
  sortBy?: "date" | "postedDate" | "title" | "company" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface GetJobMarketJobsResult {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getJobMarketSummary(): Promise<JobSummary> {
  return withMockFallback(
    async () => {
      const summaryResponse = await requestJson<ApiResponse<{
        totals: { totalJobs: number; techJobs: number; nonTechJobs: number };
        roleCategoryCounts: Record<string, number> | { name: string; count: number }[];
        seniorityCounts: Record<string, number> | { name: string; count: number }[];
        topSkills: { name: string; count: number }[];
        topTechnologies: { name: string; count: number }[];
      }>>(buildUrl("/summary"));

      if (!summaryResponse.success || !summaryResponse.data) {
        throw new Error(summaryResponse.message || "Summary request failed");
      }

      let topCompanies: { name: string; count: number }[] = [];
      let topCountries: { name: string; count: number }[] = [];

      try {
        const filtersResponse = await requestJson<ApiResponse<{
          topCompanies: { name: string; count: number }[];
          topCountries: { name: string; count: number }[];
        }>>(buildUrl("/filters"));

        topCompanies = toCountEntries(filtersResponse.data?.topCompanies).slice(0, 10);
        topCountries = toCountEntries(filtersResponse.data?.topCountries).slice(0, 10);
      } catch {
        // Keep summary available even if filters endpoint fails.
      }

      const roleCategoryCounts = toCountEntries(summaryResponse.data.roleCategoryCounts);
      const seniorityCounts = toCountEntries(summaryResponse.data.seniorityCounts);

      const topRoleCategory = roleCategoryCounts[0]?.name || "N/A";
      const topSeniority = seniorityCounts[0]?.name || "N/A";

      return {
        totalJobs: summaryResponse.data.totals.totalJobs,
        techJobs: summaryResponse.data.totals.techJobs,
        nonTechJobs: summaryResponse.data.totals.nonTechJobs,
        topRoleCategory,
        topSeniority,
        roleCategoryCounts,
        seniorityCounts,
        topSkills: toCountEntries(summaryResponse.data.topSkills).slice(0, 10),
        topTechnologies: toCountEntries(summaryResponse.data.topTechnologies).slice(0, 10),
        topCompanies,
        topCountries,
      };
    },
    () => mockSummary
  );
}

export async function getJobMarketFilters(): Promise<JobFilters> {
  return withMockFallback(
    async () => {
      const response = await requestJson<ApiResponse<{
        roleCategories: string[];
        seniorityLevels: string[];
        workModes: string[];
        topCompanies: { name: string; count: number }[];
        topCountries: { name: string; count: number }[];
      }>>(buildUrl("/filters"));

      if (!response.success || !response.data) {
        throw new Error(response.message || "Filters request failed");
      }

      return {
        roleCategories: asStringArray(response.data.roleCategories),
        seniorityLevels: asStringArray(response.data.seniorityLevels),
        workModes: asStringArray(response.data.workModes),
        companies: toCountEntries(response.data.topCompanies).map((entry) => entry.name),
        countries: toCountEntries(response.data.topCountries).map((entry) => entry.name),
      };
    },
    () => mockFilters
  );
}

export async function getJobMarketJobs(params: GetJobMarketJobsParams = {}): Promise<GetJobMarketJobsResult> {
  return withMockFallback(
    async () => {
      const response = await requestJson<ApiResponse<JobsApiItem[]>>(
        buildUrl("/jobs", {
          page: params.page,
          limit: params.limit,
          search: params.search,
          roleCategory: params.roleCategory,
          seniority: params.seniority,
          workMode: params.workMode,
          isTechJob: params.isTechJob,
          company: params.company,
          country: params.country,
          postedDateFrom: params.postedDateFrom,
          sortBy: params.sortBy === "date" ? "postedDate" : params.sortBy,
          sortOrder: params.sortOrder,
        })
      );

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(response.message || "Jobs request failed");
      }

      const pagination = response.pagination || {
        page: params.page || 1,
        limit: params.limit || 9,
        total: response.data.length,
        totalPages: 1,
      };

      return {
        jobs: response.data.map(normalizeJob),
        total: pagination.total,
        page: pagination.page,
        totalPages: Math.max(1, pagination.totalPages),
      };
    },
    () => {
      const page = params.page || 1;
      const limit = params.limit || 9;
      const search = params.search?.trim().toLowerCase();
      const sortBy = params.sortBy || "date";
      const sortOrder = params.sortOrder || "desc";

      let filtered = [...mockJobs];

      if (search) {
        filtered = filtered.filter(
          (job) =>
            job.title.toLowerCase().includes(search) ||
            job.company.toLowerCase().includes(search) ||
            job.skills.some((skill) => skill.toLowerCase().includes(search)) ||
            job.technologies.some((technology) => technology.toLowerCase().includes(search))
        );
      }

      if (params.roleCategory) filtered = filtered.filter((job) => job.roleCategory === params.roleCategory);
      if (params.seniority) filtered = filtered.filter((job) => job.seniority === params.seniority);
      if (params.workMode) filtered = filtered.filter((job) => job.workMode === params.workMode);
      if (typeof params.isTechJob === "boolean") filtered = filtered.filter((job) => job.isTechJob === params.isTechJob);
      if (params.company) {
        const companyValue = params.company.toLowerCase();
        filtered = filtered.filter((job) => job.company.toLowerCase() === companyValue);
      }
      if (params.country) {
        const countryValue = params.country.toLowerCase();
        filtered = filtered.filter((job) => job.country.toLowerCase() === countryValue);
      }

      filtered.sort((a, b) => {
        let compareResult = 0;
        if (sortBy === "date" || sortBy === "postedDate") {
          compareResult = new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
        } else if (sortBy === "title") {
          compareResult = a.title.localeCompare(b.title);
        } else if (sortBy === "company") {
          compareResult = a.company.localeCompare(b.company);
        }
        return sortOrder === "desc" ? -compareResult : compareResult;
      });

      const total = filtered.length;
      const start = (page - 1) * limit;
      const jobs = filtered.slice(start, start + limit);

      return {
        jobs,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }
  );
}

export async function getJobMarketJobById(id: string): Promise<Job | null> {
  return withMockFallback(
    async () => {
      const response = await requestJson<ApiResponse<JobsApiItem>>(buildUrl(`/jobs/id/${encodeURIComponent(id)}`));
      if (!response.success || !response.data) {
        throw new Error(response.message || "Job details request failed");
      }
      return normalizeJob(response.data);
    },
    () => mockJobs.find((job) => job.id === id) || null
  );
}

export interface CompanyRepresented {
  name: string;
  normalizedName: string;
  source: string | null;
}

export async function getCompaniesRepresented(): Promise<CompanyRepresented[]> {
  return withMockFallback(
    async () => {
      const response = await requestJson<ApiResponse<CompanyRepresented[]>>(
        buildUrl("/companies-represented")
      );

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(response.message || "Companies represented request failed");
      }

      return response.data;
    },
    () => []
  );
}

// Backward-compatible exports for existing call sites.
export type FetchJobsResult = GetJobMarketJobsResult;
export type FetchJobsParams = GetJobMarketJobsParams;
export const fetchSummary = getJobMarketSummary;
export const fetchFilters = getJobMarketFilters;
export const fetchJobs = getJobMarketJobs;
export const fetchJobById = getJobMarketJobById;

export interface GetRoleDistributionParams {
  seniority?: string;
  workMode?: string;
  country?: string;
  postedDateFrom?: string;
}

export async function getRoleDistribution(
  params: GetRoleDistributionParams = {}
): Promise<{ name: string; count: number }[]> {
  return withMockFallback(
    async () => {
      const response = await requestJson<ApiResponse<{ name: string; count: number }[]>>(
        buildUrl("/role-distribution", {
          seniority: params.seniority,
          workMode: params.workMode,
          country: params.country,
          postedDateFrom: params.postedDateFrom,
        })
      );

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(response.message || "Role distribution request failed");
      }

      return response.data;
    },
    () => mockSummary.roleCategoryCounts
  );
}