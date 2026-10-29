// Shared types + status logic for the Distribution Management section.
// Mirrors the "Distributor-wise List" report: status is derived from the number
// of months between today and the subscriber's expiry (last issue) month.

export type Distributor = {
  code: number;
  name: string;
  phone: string;
  state: string;
  area: string;
  archivedRemoved: number;
};

export type DistSubscriber = {
  id: number;
  distributorCode: number;
  subCode: number;
  name: string;
  phone: string;
  address: string;
  startMonth: string;   // YYYY-MM
  expiryMonth: string;  // YYYY-MM
  years: number | null;
};

export type DistStatus = "safe" | "near" | "grace" | "overdue" | "removed";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ymIndex(ym: string): number | null {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || "");
  return m ? Number(m[1]) * 12 + Number(m[2]) : null;
}

// Months from the current month to expiry: 0 = last issue this month, negative = expired.
export function monthsLeft(expiryMonth: string, now = new Date()): number | null {
  const e = ymIndex(expiryMonth);
  if (e === null) return null;
  return e - (now.getFullYear() * 12 + now.getMonth() + 1);
}

// Same buckets as the report footer: Safe (2+ months), Near Expiry (this/next month),
// Grace (expired 1-2 months), Over Due (3 months), Removed (more than 3 months).
export function distStatus(expiryMonth: string, now = new Date()): DistStatus {
  const l = monthsLeft(expiryMonth, now);
  if (l === null) return "removed";
  if (l >= 2) return "safe";
  if (l >= 0) return "near";
  if (l >= -2) return "grace";
  if (l === -3) return "overdue";
  return "removed";
}

// Wording copied from the report's Status column.
export function distStatusText(expiryMonth: string, now = new Date()): string {
  const l = monthsLeft(expiryMonth, now);
  if (l === null) return "";
  if (l >= 3) return "";
  if (l === 2) return "2 Months or Less, Remind to Renew";
  if (l === 1) return "One Month to Expire, Remind to Renew";
  if (l === 0) return "Expired, Last Issue, Remind to Renew";
  if (l >= -2) return "Already Expired. Grace Period. Renew";
  if (l === -3) return "Over Due. Remove/Renew.";
  return "Removed (expired more than 3 months)";
}

// "2026-10" -> "Oct/26"
export function fmtMonth(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || "");
  if (!m) return "";
  return `${MONTHS[Number(m[2]) - 1]}/${m[1].slice(2)}`;
}

// "Oct/26" or "Oct/2026" or "2026-10" -> "2026-10"; "" when unparseable.
export function parseMonthInput(v: string): string {
  const s = (v || "").trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  const m = /^([A-Za-z]{3})[\/\- ](\d{2}|\d{4})$/.exec(s);
  if (!m) return "";
  const idx = MONTHS.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
  if (idx < 0) return "";
  const y = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  return `${y}-${String(idx + 1).padStart(2, "0")}`;
}

export type DistSummary = {
  safe: number; near: number; grace: number; overdue: number;
  removed: number; total: number; active: number;
};

// Footer counts for one distributor. Removed = rows already past 3 months in the DB
// plus the count archived from earlier lists; Active = what the distributor is still sent.
export function summarize(subs: DistSubscriber[], archivedRemoved = 0, now = new Date()): DistSummary {
  const s: DistSummary = { safe: 0, near: 0, grace: 0, overdue: 0, removed: archivedRemoved, total: 0, active: 0 };
  for (const sub of subs) s[distStatus(sub.expiryMonth, now)]++;
  s.active = s.safe + s.near + s.grace + s.overdue;
  s.total = s.active + s.removed;
  return s;
}
