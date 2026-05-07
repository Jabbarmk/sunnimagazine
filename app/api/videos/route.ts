import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM videos ORDER BY created_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r, categoryId: r.category_id, categoryName: r.category_name,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO videos (id,category_id,category_name,caption,link)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE category_id=VALUES(category_id),category_name=VALUES(category_name),caption=VALUES(caption),link=VALUES(link)`,
    [b.id, b.categoryId, b.categoryName, b.caption, b.link]
  );
  return NextResponse.json({ ok: true });
}
