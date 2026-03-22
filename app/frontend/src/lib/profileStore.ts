import { getSession, setSession, getUsers, saveUsers, type KollabUser, logout } from "./authStore";
import { apiDelete } from "./api";

// ─── Profile visibility ─────────────────────────────────────
export function setProfilePublic(isPublic: boolean): void {
  const session = getSession();
  if (!session) return;
  const updated = { ...session, isProfilePublic: isPublic };
  setSession(updated);
  const users = getUsers();
  saveUsers(users.map(u => u.id === session.id ? { ...u, isProfilePublic: isPublic } : u));
}

export function isProfilePublic(): boolean {
  return getSession()?.isProfilePublic ?? true;
}

// ─── Joined projects ────────────────────────────────────────
const JOINED_KEY = "kollab_joined_projects";

export interface JoinedProject {
  projectId: string;
  role: string;
  joinedAt: string;
}

export function getJoinedProjects(userId: string): JoinedProject[] {
  try {
    const all = JSON.parse(localStorage.getItem(JOINED_KEY) || "{}");
    return all[userId] || [];
  } catch { return []; }
}

export function joinProject(userId: string, projectId: string, role: string): void {
  const all = JSON.parse(localStorage.getItem(JOINED_KEY) || "{}");
  const list: JoinedProject[] = all[userId] || [];
  if (list.some(j => j.projectId === projectId)) return;
  list.push({ projectId, role, joinedAt: new Date().toISOString() });
  all[userId] = list;
  localStorage.setItem(JOINED_KEY, JSON.stringify(all));
}

export function leaveProject(userId: string, projectId: string): void {
  const all = JSON.parse(localStorage.getItem(JOINED_KEY) || "{}");
  const list: JoinedProject[] = all[userId] || [];
  all[userId] = list.filter(j => j.projectId !== projectId);
  localStorage.setItem(JOINED_KEY, JSON.stringify(all));
}

// ─── Change password ────────────────────────────────────────
export function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const session = getSession();
  if (!session) return { success: false, error: "No session." };
  if (session.password !== currentPassword) return { success: false, error: "Current password is incorrect." };
  const users = getUsers();
  saveUsers(users.map(u => u.id === session.id ? { ...u, password: newPassword } : u));
  setSession({ ...session, password: newPassword });
  return { success: true };
}

// ─── Delete account ─────────────────────────────────────────
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  const session = getSession();
  if (!session) return { success: false, error: "Not logged in" };
  try {
    await apiDelete<{ success: boolean; message?: string }>("/profile/me");
    const users = getUsers();
    saveUsers(users.filter((u) => u.id !== session.id));
    logout();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete account" };
  }
}
