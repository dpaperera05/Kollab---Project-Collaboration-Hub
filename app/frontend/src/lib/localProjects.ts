import type { Project } from "@/data/mockProjects";

const STORAGE_KEY = "kollab_projects_created";

export function getLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function saveLocalProject(project: Project): void {
  const existing = getLocalProjects();
  const updated = [project, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getAllProjects(mockProjects: Project[]): Project[] {
  const local = getLocalProjects();
  // local projects come first (newest on top)
  const localIds = new Set(local.map((p) => p.id));
  const filtered = mockProjects.filter((p) => !localIds.has(p.id));
  return [...local, ...filtered];
}

export function generateProjectId(): string {
  return `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
