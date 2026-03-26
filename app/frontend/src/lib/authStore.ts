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

const VALID_RESET_CODE = "654321";

export function requestPasswordReset(_email: string): { success: true } {
  // Always returns success — never reveals whether the email exists
  return { success: true };
}

type ResetPasswordResult =
  | { success: true }
  | { success: false; error: string };

export function resetPassword(
  email: string,
  newPassword: string,
  code: string
): ResetPasswordResult {
  if (code !== VALID_RESET_CODE) {
    return { success: false, error: "Invalid reset code." };
  }

  const users = getUsers();
  const updated = users.map((u) =>
    u.email.toLowerCase() === email.toLowerCase()
      ? { ...u, password: newPassword }
      : u
  );
  saveUsers(updated);

  // Always success — don't reveal if user exists
  return { success: true };
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
