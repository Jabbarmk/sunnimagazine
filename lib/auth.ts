const AUTH_KEY = "gs_auth_v1";
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
