const STORAGE_KEY = "kollab_portfolio_showcases";

export interface PortfolioShowcase {
  id: string;
  ownerId: string;
  title: string;
  role: string;
  summary: string;
  problem: string;
  solution: string;
  responsibilities: string;
  outcomes: string;
  techStack: string[];
  links: { label: string; url: string }[];
  coverImage?: string;
  screenshots?: string[];
  collaborators: { name: string; role: string }[];
  specialNotes: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

function getAll(): PortfolioShowcase[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveAll(items: PortfolioShowcase[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getShowcasesByOwner(ownerId: string): PortfolioShowcase[] {
  return getAll().filter(s => s.ownerId === ownerId);
}

export function getShowcaseById(id: string): PortfolioShowcase | undefined {
  return getAll().find(s => s.id === id);
}

export function createShowcase(data: Omit<PortfolioShowcase, "id" | "createdAt" | "updatedAt">): PortfolioShowcase {
  const item: PortfolioShowcase = {
    ...data,
    id: `showcase-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveAll([item, ...getAll()]);
  return item;
}

export function updateShowcase(id: string, data: Partial<PortfolioShowcase>): void {
  const all = getAll();
  saveAll(all.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
}

export function deleteShowcase(id: string): void {
  saveAll(getAll().filter(s => s.id !== id));
}
