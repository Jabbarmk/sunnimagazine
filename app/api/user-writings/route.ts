import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM user_writings ORDER BY sent_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r,
    artCategoryId: r.art_category_id,
    artCategoryName: r.art_category_name,
    sentAt: r.sent_at,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO user_writings (id,name,email,art_category_id,art_category_name,description,image,sent_at,status)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [b.id, b.name, b.email, b.artCategoryId, b.artCategoryName, b.description, b.image || null, b.sentAt, b.status || "pending"]
  );
  return NextResponse.json({ ok: true });
}
