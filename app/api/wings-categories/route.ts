import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic"; // avoid build-time prerender querying the DB
export async function GET() {
  const [rows] = await db.query(
    `SELECT c.*, (SELECT COUNT(*) FROM wings w WHERE w.category_id = c.id) AS item_count
     FROM wings_categories c
     ORDER BY c.sort_order ASC, c.created_at DESC`
  );
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id, name: r.name, image: r.image, sortOrder: r.sort_order,
    itemCount: Number(r.item_count) || 0,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO wings_categories (id, name, image, sort_order)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE name=VALUES(name), image=VALUES(image), sort_order=VALUES(sort_order)`,
    [b.id, b.name, b.image || null, b.sortOrder ?? 0]
  );
  return NextResponse.json({ ok: true });
}
