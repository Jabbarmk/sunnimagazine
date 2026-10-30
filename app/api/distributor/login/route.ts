import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { mapDist } from "@/lib/distributionDb";
import { signDistributorToken, loginLocked, recordLoginFailure, clearLoginFailures } from "@/lib/distributorAuth";

// POST { username, password } -> { token, distributor }. Used by the portal and the mobile app.
export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  const user = String(username || "").trim();
  if (!user || !password) return NextResponse.json({ error: "Username and password are required" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${user.toLowerCase()}|${ip}`;
  if (loginLocked(key)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const [rows] = await db.query("SELECT * FROM distribution_distributors WHERE username=? LIMIT 1", [user]);
  const d = (rows as any[])[0];
  const ok = !!d && !!d.password && !!d.is_active && (await bcrypt.compare(String(password), d.password));
  if (!ok) {
    recordLoginFailure(key);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  clearLoginFailures(key);
  await db.query("UPDATE distribution_distributors SET last_login=NOW() WHERE code=?", [d.code]);
  return NextResponse.json({ token: signDistributorToken(d.code), distributor: mapDist(d) });
}
