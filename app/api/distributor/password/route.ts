import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { requireDistributor } from "@/lib/distributorAuth";

// POST { oldPassword, newPassword } — a distributor changes their own password.
export async function POST(req: Request) {
  const auth = await requireDistributor(req);
  if ("error" in auth) return auth.error;

  const { oldPassword, newPassword } = await req.json().catch(() => ({}));
  if (!oldPassword || !newPassword) return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
  if (String(newPassword).length < 6) return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  if (!(await bcrypt.compare(String(oldPassword), auth.row.password))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }
  await db.query("UPDATE distribution_distributors SET password=? WHERE code=?", [await bcrypt.hash(String(newPassword), 10), auth.row.code]);
  return NextResponse.json({ ok: true });
}
