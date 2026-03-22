import { getSession } from "./authStore";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const buildHeaders = () => {
  const session = getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  return headers;
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: buildHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || "Request failed");
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers: buildHeaders(), body: JSON.stringify(body ?? {}) });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || "Request failed");
  return (await res.json()) as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PUT", headers: buildHeaders(), body: JSON.stringify(body ?? {}) });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || "Request failed");
  return (await res.json()) as T;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "PATCH", headers: buildHeaders(), body: JSON.stringify(body ?? {}) });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || "Request failed");
  return (await res.json()) as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: buildHeaders() });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || "Request failed");
  return (await res.json()) as T;
}
