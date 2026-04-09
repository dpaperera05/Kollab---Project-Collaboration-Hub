import { mockJobs, mockSummary, mockFilters, type Job, type JobSummary, type JobFilters } from "@/data/mockJobMarket";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchSummary(): Promise<JobSummary> {
  await delay(400);
  return mockSummary;
}

export async function fetchFilters(): Promise<JobFilters> {
  await delay(200);
  return mockFilters;
}

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  roleCategory?: string;
  seniority?: string;
  workMode?: string;
  isTechJob?: boolean;
  company?: string;
  country?: string;
  sortBy?: "date" | "title" | "company";
  sortOrder?: "asc" | "desc";
}

export interface FetchJobsResult {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchJobs(params: FetchJobsParams = {}): Promise<FetchJobsResult> {
  await delay(300);
  const { page = 1, limit = 9, search, roleCategory, seniority, workMode, isTechJob, company, country, sortBy = "date", sortOrder = "desc" } = params;

  let filtered = [...mockJobs];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q)) ||
        j.technologies.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (roleCategory) filtered = filtered.filter((j) => j.roleCategory === roleCategory);
  if (seniority) filtered = filtered.filter((j) => j.seniority === seniority);
  if (workMode) filtered = filtered.filter((j) => j.workMode === workMode);
  if (isTechJob !== undefined) filtered = filtered.filter((j) => j.isTechJob === isTechJob);
  if (company) filtered = filtered.filter((j) => j.company === company);
  if (country) filtered = filtered.filter((j) => j.country === country);

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "date") cmp = new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
    else if (sortBy === "title") cmp = a.title.localeCompare(b.title);
    else if (sortBy === "company") cmp = a.company.localeCompare(b.company);
    return sortOrder === "desc" ? -cmp : cmp;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const jobs = filtered.slice(start, start + limit);

  return { jobs, total, page, totalPages };
}

export async function fetchJobById(id: string): Promise<Job | null> {
  await delay(250);
  return mockJobs.find((j) => j.id === id) || null;
}