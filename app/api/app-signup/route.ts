import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { name, email, mobile } = await req.json();
  if (!name?.trim() || !email?.trim())
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });

  const [dupEmail] = await db.query("SELECT id FROM app_users WHERE email=?", [email]);
  if ((dupEmail as any[]).length > 0)
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  if (mobile?.trim()) {
    const [dupMobile] = await db.query("SELECT id FROM app_users WHERE mobile=?", [mobile]);
    if ((dupMobile as any[]).length > 0)
      return NextResponse.json({ error: "Mobile number already registered" }, { status: 409 });
  }

  const id = "usr_" + Date.now();
  await db.query(
    `INSERT INTO app_users (id,name,email,mobile,password,is_active,location,photo)
     VALUES (?,?,?,?,?,1,'',NULL)`,
    [id, name.trim(), email.trim(), mobile?.trim() || null]
  );

  return NextResponse.json({ ok: true, id });
}
