// Server-side auth for distributor logins (portal + mobile app). Unlike the admin
// dashboard, these endpoints verify a signed token on every request so a distributor
// can only ever read or change their own list.
import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";

// Set DISTRIBUTOR_TOKEN_SECRET in the server env to use your own secret; otherwise one
// is derived from the DB settings so it works with no extra configuration.
const SECRET =
  process.env.DISTRIBUTOR_TOKEN_SECRET ||
  crypto.createHash("sha256")
    .update(`gs-distributor|${process.env.DB_USER || ""}|${process.env.DB_PASSWORD || ""}|${process.env.DB_NAME || ""}`)
    .digest("hex");

const TOKEN_DAYS = 30;

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const sign = (data: string) => crypto.createHmac("sha256", SECRET).update(data).digest("base64url");

export function signDistributorToken(code: number): string {
  const body = b64(JSON.stringify({ c: code, exp: Date.now() + TOKEN_DAYS * 86400_000 }));
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string): number | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig), e = Buffer.from(sign(body));
  if (a.length !== e.length || !crypto.timingSafeEqual(a, e)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!Number.isInteger(p.c) || typeof p.exp !== "number" || p.exp < Date.now()) return null;
    return p.c;
  } catch { return null; }
}

// Resolves the signed-in distributor's DB row, or a ready-made 401 response.
export async function requireDistributor(req: Request): Promise<{ row: any } | { error: NextResponse }> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const code = token ? verifyToken(token) : null;
  const unauth = () => ({ error: NextResponse.json({ error: "Please sign in again" }, { status: 401 }) });
  if (code === null) return unauth();
  const [rows] = await db.query("SELECT * FROM distribution_distributors WHERE code=?", [code]);
  const row = (rows as any[])[0];
  // Disabling a login or clearing its password locks the distributor out immediately.
  if (!row || !row.is_active || !row.password) return unauth();
  return { row };
}

// Tiny in-memory brute-force guard: 5 failures per username+IP locks it for 15 minutes.
const fails = new Map<string, { n: number; until: number }>();
export const loginLocked = (key: string) => (fails.get(key)?.until ?? 0) > Date.now();
export function recordLoginFailure(key: string) {
  const f = fails.get(key);
  const expired = !!f && f.until > 0 && f.until < Date.now();
  const n = (expired ? 0 : f?.n ?? 0) + 1;
  fails.set(key, { n, until: n >= 5 ? Date.now() + 15 * 60_000 : 0 });
}
export const clearLoginFailures = (key: string) => { fails.delete(key); };
