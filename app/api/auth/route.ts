import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Required" }, { status: 400 });
  }

  const [rows] = await db.query("SELECT * FROM admins WHERE email=?", [email]);
  const admin = (rows as any[])[0];
  if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const stored = String(admin.password || "");
  const isBcryptHash = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");

  let ok: boolean;
  if (isBcryptHash) {
    ok = await bcrypt.compare(password, stored);
  } else {
    // Legacy plaintext password — check directly, then self-heal to a
    // bcrypt hash on this successful login so no manual migration is needed.
    ok = password === stored;
    if (ok) {
      const hash = await bcrypt.hash(password, 10);
      await db.query("UPDATE admins SET password=? WHERE id=?", [hash, admin.id]);
    }
  }

  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  return NextResponse.json({
    id: admin.id,
    email: admin.email,
    role: admin.role || "admin",
  });
}
