// Shared Emirates constants + visibility rule.
// Pure module (no "use client") so it can be used on server and client.

export const GLOBAL = "Global";

// The seven UAE emirates.
export const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

// Options a user can pick (includes Global = sees everything).
// Also the options for tagging content (Global = shown to everyone).
export const EMIRATES_WITH_GLOBAL: string[] = [...EMIRATES, GLOBAL];

/**
 * Should a viewer whose emirate is `userEmirate` see an item tagged `itemEmirate`?
 * - A "Global" user sees everything.
 * - "Global" content is shown to everyone.
 * - A user with a specific emirate sees that emirate + Global.
 * - A user with no emirate set sees only Global content.
 */
export function emirateVisible(
  userEmirate: string | null | undefined,
  itemEmirate: string | null | undefined
): boolean {
  const ue = (userEmirate || "").trim();
  const ie = (itemEmirate || "").trim() || GLOBAL; // untagged content = Global
  if (ue === GLOBAL) return true;
  if (ie === GLOBAL) return true;
  if (!ue) return false; // empty user, non-global item
  return ie === ue;
}
