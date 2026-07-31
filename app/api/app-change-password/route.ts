import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { id, currentPassword, newPassword } = await req.json();
  if (!id || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "Required" }, { status: 400 });
  }
  if (String(newPassword).length < 6) {
    return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
  }

  const [rows] = await db.query(
    "SELECT id, password FROM app_users WHERE id=? AND deleted_at IS NULL",
    [id]
  );
  const u = (rows as any[])[0];
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const stored = String(u.password || "");
  const isBcryptHash = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
  const ok = isBcryptHash
    ? await bcrypt.compare(currentPassword, stored)
    : currentPassword === stored;

  if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  const hash = await bcrypt.hash(String(newPassword), 10);
  await db.query("UPDATE app_users SET password=? WHERE id=?", [hash, u.id]);

  return NextResponse.json({ ok: true });
}
