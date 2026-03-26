import { buildApiUrl } from "./apiConfig";

export interface KollabUserProfile {
  name?: string;
  bio?: string;
  timezone?: string;
  location?: string;
  avatarUrl?: string;
  avatarKey?: string;
  preferredRoles?: string[];
  skills?: string[];
  techStack?: string[];
  expertiseSkills?: string[];
  headline?: string;
  languages?: string[];
  rateType?: "free" | "paid";
  rateNote?: string;
  links?: { github?: string; linkedin?: string; portfolio?: string };
  availabilityHoursPerWeek?: number;
  domainInterests?: string[];
  availabilitySlots?: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  note?: string;
}

export interface KollabUser {
  id: string;
  email: string;
  password: string;
  userType: "member" | "mentor";
  isEmailVerified: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: string;
  isProfilePublic?: boolean;
  name?: string;
  token?: string;
  verificationToken?: string;
  profile?: KollabUserProfile;
}

type LoginResult =
  | { success: true; user: KollabUser }
  | { success: false; error: string };

type RegisterResult =
  | { success: true; user: KollabUser }
  | { success: false; error: string };

const VERIFICATION_TOKEN_KEY = "kollab_verification_token";

const USERS_KEY = "kollab_users";
const SESSION_KEY = "kollab_auth_user";

const getAuthHeaders = () => {
  const session = getSession();
  if (!session?.token) return undefined;
  return {
    Authorization: `Bearer ${session.token}`,
    "Content-Type": "application/json",
  };
};

const persistUserFromApi = (apiUser: Partial<KollabUser>) => {
  const session = getSession();
  if (!session || !apiUser?.id) return;
  const merged: KollabUser = { ...session, ...apiUser } as KollabUser;
  const users = getUsers();
  saveUsers(users.map((u) => (u.id === merged.id ? merged : u)));
  setSession(merged);
};

export function getUsers(): KollabUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveUsers(users: KollabUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function setSession(user: KollabUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

const saveVerificationToken = (token: string) => {
  localStorage.setItem(VERIFICATION_TOKEN_KEY, token);
};

const getVerificationToken = (): string | null => {
  return localStorage.getItem(VERIFICATION_TOKEN_KEY);
};

const clearVerificationToken = () => {
  localStorage.removeItem(VERIFICATION_TOKEN_KEY);
};

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(buildApiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return { success: false, error: payload?.message || "Login failed" };
    }

    const apiUser = payload?.data?.user;
    const token = payload?.data?.token as string | undefined;

    if (!apiUser?.id || !token) {
      return { success: false, error: "Invalid response from server" };
    }

    const user: KollabUser = {
      ...apiUser,
      password,
      token,
      isEmailVerified: Boolean(apiUser.isEmailVerified),
    };

    const users = getUsers();
    saveUsers([...users.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase()), user]);
    setSession(user);
    if (apiUser) {
      persistUserFromApi({ ...apiUser, token } as KollabUser);
    }
    return { success: true, user };
  } catch (error) {
    console.error("Login request failed", error);
    return { success: false, error: "Unable to login. Please try again." };
  }
}

export async function register(
  email: string,
  password: string,
  userType: "member" | "mentor"
): Promise<RegisterResult> {
  try {
    const response = await fetch(buildApiUrl("/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userType }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return { success: false, error: payload?.message || "Registration failed" };
    }

    const apiUser = payload?.data?.user;
    const token = payload?.data?.token as string | undefined;
    const verificationToken = payload?.data?.verificationToken as string | undefined;

    if (!apiUser?.id || !apiUser?.email) {
      return { success: false, error: "Invalid response from server" };
    }

    const newUser: KollabUser = {
      id: apiUser.id,
      email: apiUser.email,
      name: apiUser.name,
      password,
      userType: apiUser.userType || userType,
      isEmailVerified: Boolean(apiUser.isEmailVerified),
      token,
      verificationToken,
      onboardingCompleted: apiUser.onboardingCompleted,
      onboardingStep: apiUser.onboardingStep,
      profile: apiUser.profile,
    };

    const users = getUsers();
    saveUsers([...users, newUser]);
    setSession(newUser);

    if (verificationToken) {
      saveVerificationToken(verificationToken);
    }

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Register request failed", error);
    return { success: false, error: "Unable to register. Please try again." };
  }
}

export function getSession(): KollabUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

type VerifyResult =
  | { success: true; user: KollabUser }
  | { success: false; error: string };

export async function verifyEmail(code: string): Promise<VerifyResult> {
  const session = getSession();
  const verificationToken = getVerificationToken();

  if (!session || !verificationToken) {
    return { success: false, error: "No verification session found." };
  }

  try {
    const response = await fetch(buildApiUrl("/auth/verify-email"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.email, code, verificationToken }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return { success: false, error: payload?.message || "Verification failed" };
    }

    const apiUser = payload?.data?.user;
    if (!apiUser?.id) {
      return { success: false, error: "Invalid response from server" };
    }

    const updatedUser: KollabUser = {
      ...session,
      ...apiUser,
      isEmailVerified: true,
    };

    const users = getUsers();
    saveUsers(users.map((u) => (u.id === session.id ? updatedUser : u)));
    setSession(updatedUser);
    clearVerificationToken();

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Verify request failed", error);
    return { success: false, error: "Unable to verify. Please try again." };
  }
}

const RESET_TOKEN_KEY = "kollab_reset_tokens"; // map of email -> resetToken

const saveResetToken = (email: string, token: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(RESET_TOKEN_KEY) || "{}") as Record<string, string>;
    map[email.toLowerCase()] = token;
    localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

const getResetToken = (email: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(RESET_TOKEN_KEY) || "{}") as Record<string, string>;
    return map[email.toLowerCase()] || null;
  } catch {
    return null;
  }
};

const clearResetToken = (email: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(RESET_TOKEN_KEY) || "{}") as Record<string, string>;
    delete map[email.toLowerCase()];
    localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

type RequestResetResult =
  | { success: true; resetToken?: string; code?: string }
  | { success: false; error: string };

export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  try {
    const payload = await fetch(buildApiUrl("/auth/forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })).catch(() => ({ ok: false, data: null })));

    if (!payload.ok) {
      return { success: false, error: payload.data?.message || "Failed to request password reset" };
    }

    const resetToken = payload.data?.data?.resetToken as string | undefined;
    const code = payload.data?.data?.code as string | undefined;
    if (resetToken) {
      saveResetToken(email, resetToken);
    }

    return { success: true, resetToken, code };
  } catch (err) {
    console.error("requestPasswordReset failed", err);
    return { success: false, error: "Unable to request password reset. Please try again." };
  }
}

type ResetPasswordResult =
  | { success: true }
  | { success: false; error: string };

export async function resetPassword(
  email: string,
  newPassword: string,
  code: string
): Promise<ResetPasswordResult> {
  const resetToken = getResetToken(email);
  if (!resetToken) {
    return { success: false, error: "Reset token missing. Please request a new code." };
  }

  try {
    const payload = await fetch(buildApiUrl("/auth/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, resetToken, newPassword }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })).catch(() => ({ ok: false, data: null })));

    if (!payload.ok) {
      return { success: false, error: payload.data?.message || "Failed to reset password" };
    }

    clearResetToken(email);
    return { success: true };
  } catch (err) {
    console.error("resetPassword failed", err);
    return { success: false, error: "Unable to reset password. Please try again." };
  }
}

// ─── Onboarding helpers ─────────────────────────────────────

export function updateUserProfile(partial: Partial<KollabUserProfile>): void {
  const session = getSession();
  if (!session) return;
  const profile = { ...(session.profile || {}), ...partial };
  const updated = { ...session, profile };
  setSession(updated);
  const users = getUsers();
  saveUsers(users.map((u) => (u.id === session.id ? { ...u, profile } : u)));

  const headers = getAuthHeaders();
  if (!headers) return;
  void fetch(buildApiUrl("/onboarding/me"), {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...partial }),
  })
    .then((res) => res.json().catch(() => null))
    .then((payload) => {
      const apiUser = payload?.data?.user;
      if (apiUser?.id) {
        persistUserFromApi(apiUser as KollabUser);
      }
    })
    .catch((err) => {
      console.error("Failed to sync profile", err);
    });
}

export function setOnboardingStep(step: string): void {
  const session = getSession();
  if (!session) return;
  const updated = { ...session, onboardingStep: step };
  setSession(updated);
  const users = getUsers();
  saveUsers(users.map((u) => (u.id === session.id ? { ...u, onboardingStep: step } : u)));

  const headers = getAuthHeaders();
  if (!headers) return;
  void fetch(buildApiUrl("/onboarding/me"), {
    method: "PUT",
    headers,
    body: JSON.stringify({ onboardingStep: step }),
  })
    .then((res) => res.json().catch(() => null))
    .then((payload) => {
      const apiUser = payload?.data?.user;
      if (apiUser?.id) {
        persistUserFromApi(apiUser as KollabUser);
      }
    })
    .catch((err) => {
      console.error("Failed to sync onboarding step", err);
    });
}

export function setOnboardingCompleted(): void {
  const session = getSession();
  if (!session) return;
  const updated = { ...session, onboardingCompleted: true, onboardingStep: undefined };
  setSession(updated);
  const users = getUsers();
  saveUsers(users.map((u) => (u.id === session.id ? { ...u, onboardingCompleted: true, onboardingStep: undefined } : u)));

  const headers = getAuthHeaders();
  if (!headers) return;
  void fetch(buildApiUrl("/onboarding/complete"), {
    method: "POST",
    headers,
  })
    .then((res) => res.json().catch(() => null))
    .then((payload) => {
      const apiUser = payload?.data?.user;
      if (apiUser?.id) {
        persistUserFromApi(apiUser as KollabUser);
      }
    })
    .catch((err) => {
      console.error("Failed to mark onboarding complete", err);
    });
}
