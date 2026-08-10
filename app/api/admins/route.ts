import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [rows] = await db.query("SELECT id, email, mobile, role FROM admins ORDER BY id ASC");
  return NextResponse.json(rows);
}

// Create a new admin, or update an existing one (pass `id`). Password is
// only hashed+updated if provided — leave blank on edit to keep the current
// password, matching the pattern used for app users.
export async function POST(req: Request) {
  const b = await req.json();
  const email = (b.email || "").trim();
  const mobile = (b.mobile || "").trim() || null;
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const [dup] = await db.query("SELECT id FROM admins WHERE email=? AND id!=?", [email, b.id || 0]);
  if ((dup as any[]).length > 0) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }
  if (mobile) {
    const [dupMobile] = await db.query("SELECT id FROM admins WHERE mobile=? AND id!=?", [mobile, b.id || 0]);
    if ((dupMobile as any[]).length > 0) {
      return NextResponse.json({ error: "An admin with this mobile number already exists" }, { status: 409 });
    }
  }

  if (b.id) {
    if (b.password?.trim()) {
      const hash = await bcrypt.hash(b.password.trim(), 10);
      await db.query("UPDATE admins SET email=?, mobile=?, role=?, password=? WHERE id=?", [email, mobile, b.role || "admin", hash, b.id]);
    } else {
      await db.query("UPDATE admins SET email=?, mobile=?, role=? WHERE id=?", [email, mobile, b.role || "admin", b.id]);
    }
    return NextResponse.json({ ok: true, id: b.id });
  }

  if (!b.password?.trim()) return NextResponse.json({ error: "Password is required" }, { status: 400 });
  const hash = await bcrypt.hash(b.password.trim(), 10);
  const [result] = await db.query(
    "INSERT INTO admins (email, mobile, password, role) VALUES (?,?,?,?)",
    [email, mobile, hash, b.role === "super_admin" ? "super_admin" : "admin"]
  );
  return NextResponse.json({ ok: true, id: (result as any).insertId });
}
