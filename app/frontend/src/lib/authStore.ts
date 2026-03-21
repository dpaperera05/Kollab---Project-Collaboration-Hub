export interface KollabUserProfile {
  name?: string;
  bio?: string;
  timezone?: string;
  location?: string;
  preferredRoles?: string[];
  skills?: string[];
  techStack?: string[];
  expertiseSkills?: string[];
  links?: { github?: string; linkedin?: string; portfolio?: string };
  availabilityHoursPerWeek?: number;
  domainInterests?: string[];
  avatar?: string;
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
  profile?: KollabUserProfile;
}

type LoginResult =
  | { success: true; user: KollabUser }
  | { success: false; error: string };

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RegisterResult =
  | { success: true; user: KollabUser }
  | { success: false; error: string };

const USERS_KEY = "kollab_users";
const SESSION_KEY = "kollab_auth_user";

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

export function login(email: string, password: string): LoginResult {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  setSession(user);
  return { success: true, user };
}

export async function register(
  email: string,
  password: string,
  userType: "member" | "mentor"
): Promise<RegisterResult> {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
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
    };

    const users = getUsers();
    saveUsers([...users, newUser]);
    setSession(newUser);

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
  | { success: true }
  | { success: false; error: string };

const VALID_OTP = "123456";

export function verifyEmail(code: string): VerifyResult {
  if (code !== VALID_OTP) {
    return { success: false, error: "Invalid code. Please try again." };
  }

  const session = getSession();
  if (!session) {
    return { success: false, error: "No active session." };
  }

  // Update user in users list
  const users = getUsers();
  const updated = users.map((u) =>
    u.id === session.id ? { ...u, isEmailVerified: true } : u
  );
  saveUsers(updated);

  // Update session
  setSession({ ...session, isEmailVerified: true });

  return { success: true };
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
  // Update session
  setSession(updated);
  // Update users list
  const users = getUsers();
  saveUsers(users.map(u => u.id === session.id ? { ...u, profile } : u));
}

export function setOnboardingStep(step: string): void {
  const session = getSession();
  if (!session) return;
  const updated = { ...session, onboardingStep: step };
  setSession(updated);
  const users = getUsers();
  saveUsers(users.map(u => u.id === session.id ? { ...u, onboardingStep: step } : u));
}

export function setOnboardingCompleted(): void {
  const session = getSession();
  if (!session) return;
  const updated = { ...session, onboardingCompleted: true, onboardingStep: undefined };
  setSession(updated);
  const users = getUsers();
  saveUsers(users.map(u => u.id === session.id ? { ...u, onboardingCompleted: true, onboardingStep: undefined } : u));
}
