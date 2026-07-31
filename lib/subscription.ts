// Shared subscription date/status logic — single source of truth used by the
// dashboard (Users, Deleted Users), the login API (isExpired flag), the
// expiry-reminder API, and receipt emails. Was previously duplicated with
// slightly different implementations in each place.
//
// Dates are stored as either "YYYY-MM" (legacy, month-only) or "YYYY-MM-DD"
// (current, day-precise) — native Date parsing handles both natively, so no
// special-casing is needed. Legacy month-only values are treated as the 1st
// of that month.

export type SubStatus = "active" | "expiring" | "expired" | "none";

export function daysLeft(to: string): number {
  if (!to) return 0;
  const d = new Date(to);
  if (isNaN(d.getTime())) return 0;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

export function subStatus(to: string): SubStatus {
  if (!to) return "none";
  const d = daysLeft(to);
  if (d < 0) return "expired";
  if (d <= 30) return "expiring";
  return "active";
}

export function isSubscriptionExpired(to: string): boolean {
  return subStatus(to) === "expired";
}

// "DD/MM/YYYY", e.g. "15/07/2026". Uses UTC getters so the displayed date
// doesn't shift by a day depending on the server's/viewer's timezone (dates
// parse as UTC midnight).
export function fmtDate(raw: string): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
