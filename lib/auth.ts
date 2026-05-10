const AUTH_KEY = "gs_auth_v1";
const DASHBOARD_AUTH_KEY = "gs_dashboard_auth_v1";
const APP_USER_KEY = "gs_app_user_v1";
const ADMIN_EMAIL = "admin@gulfsathyadhara.com";
const ADMIN_PASSWORD = "admin123";

export function login(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    if (typeof window !== "undefined") localStorage.setItem(AUTH_KEY, "auth");
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") localStorage.removeItem(AUTH_KEY);
}

export function isDashboardAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DASHBOARD_AUTH_KEY) === "admin";
}

export function dashboardLogout(): void {
  if (typeof window !== "undefined") localStorage.removeItem(DASHBOARD_AUTH_KEY);
}

export function skipLogin(): void {
  if (typeof window !== "undefined") localStorage.setItem(AUTH_KEY, "skip");
}

export function getAuthState(): "auth" | "skip" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(AUTH_KEY);
  if (v === "auth" || v === "skip") return v;
  return null;
}

export function isAuthenticated(): boolean {
  const s = getAuthState();
  return s === "auth" || s === "skip";
}

export type StoredUser = {
  id: string; name: string; email: string; mobile: string;
  location: string; photo: string;
  subscriptionFrom: string; subscriptionTo: string;
  referredBy: string; referralMobile: string;
};

export async function loginAppUser(identifier: string, password: string): Promise<boolean> {
  const res = await fetch("/api/app-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) return false;
  const user = await res.json();
  localStorage.setItem(AUTH_KEY, "auth");
  localStorage.setItem(APP_USER_KEY, JSON.stringify(user));
  return true;
}

export function getAppUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(APP_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearAppUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(APP_USER_KEY);
  localStorage.setItem(AUTH_KEY, "skip");
}
