const rawBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Ensure we always point at the Express /api mount
const baseWithApi = rawBase.endsWith("/api") ? rawBase : `${rawBase || ""}/api`;

export const API_BASE = baseWithApi.replace(/\/$/, "");

export const buildApiUrl = (path: string) => {
  const safePath = path?.startsWith("/") ? path : `/${path || ""}`;
  return `${API_BASE}${safePath}`;
};
