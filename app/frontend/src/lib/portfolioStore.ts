import { apiDelete, apiGet, apiPost, apiPut } from "./api";

export interface PortfolioLink {
  label?: string;
  url: string;
}

export interface PortfolioShowcase {
  id: string;
  ownerId: string;
  title: string;
  role?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  responsibilities?: string;
  outcomes?: string;
  techStack: string[];
  links: PortfolioLink[];
  coverImage?: string;
  screenshots: string[];
  collaborators: string[];
  specialNotes?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PortfolioInput = Partial<
  Omit<PortfolioShowcase, "id" | "ownerId" | "createdAt" | "updatedAt">
> & { title: string };

interface PortfolioListResponse {
  success: boolean;
  data: { items: any[] };
}

interface PortfolioItemResponse {
  success: boolean;
  data: { item: any };
}

const normalizeLinks = (links: unknown): PortfolioLink[] => {
  if (!Array.isArray(links)) return [];
  return links
    .map((l: any) => ({
      label: typeof l?.label === "string" ? l.label : undefined,
      url: typeof l?.url === "string" ? l.url : "",
    }))
    .filter((l) => !!l.url);
};

const normalizeItem = (raw: any): PortfolioShowcase => ({
  id: raw?._id || raw?.id || "",
  ownerId: raw?.userId || "",
  title: raw?.title || "",
  role: raw?.role || "",
  summary: raw?.summary || "",
  problem: raw?.problem || "",
  solution: raw?.solution || "",
  responsibilities: raw?.responsibilities || "",
  outcomes: raw?.outcomes || "",
  techStack: Array.isArray(raw?.techStack) ? raw.techStack : [],
  links: normalizeLinks(raw?.links),
  coverImage: raw?.coverImage || "",
  screenshots: Array.isArray(raw?.screenshots) ? raw.screenshots : [],
  collaborators: Array.isArray(raw?.collaborators) ? raw.collaborators : [],
  specialNotes: raw?.specialNotes || "",
  isPublished: typeof raw?.isPublished === "boolean" ? raw.isPublished : false,
  createdAt: raw?.createdAt,
  updatedAt: raw?.updatedAt,
});

export async function fetchMyShowcases(): Promise<PortfolioShowcase[]> {
  const res = await apiGet<PortfolioListResponse>("/portfolio");
  return (res.data?.items || []).map(normalizeItem);
}

export async function fetchShowcaseById(id: string): Promise<PortfolioShowcase> {
  try {
    const res = await apiGet<PortfolioItemResponse>(`/portfolio/public/${id}`);
    return normalizeItem(res.data?.item);
  } catch (error: any) {
    if (error?.status && error.status !== 404) {
      throw error;
    }
  }

  const authed = await apiGet<PortfolioItemResponse>(`/portfolio/${id}`);
  return normalizeItem(authed.data?.item);
}

export async function createShowcase(payload: PortfolioInput): Promise<PortfolioShowcase> {
  const res = await apiPost<PortfolioItemResponse>("/portfolio", payload);
  return normalizeItem(res.data?.item);
}

export async function updateShowcase(id: string, payload: Partial<PortfolioInput>): Promise<PortfolioShowcase> {
  const res = await apiPut<PortfolioItemResponse>(`/portfolio/${id}`, payload);
  return normalizeItem(res.data?.item);
}

export async function deleteShowcase(id: string): Promise<void> {
  await apiDelete(`/portfolio/${id}`);
}
