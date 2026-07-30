import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic"; // avoid build-time prerender querying the DB
export async function GET(req: Request) {
  const categoryId = new URL(req.url).searchParams.get("categoryId");
  const where = categoryId ? "WHERE w.category_id=?" : "";
  const args = categoryId ? [categoryId] : [];

  const [rows] = await db.query(
    `SELECT * FROM wings w ${where} ORDER BY w.sort_order ASC, w.created_at DESC`,
    args
  );
  const wings = rows as any[];
  const ids = wings.map((w) => w.id);

  let imagesByWing: Record<string, string[]> = {};
  if (ids.length) {
    const [imgRows] = await db.query(
      `SELECT wing_id, url FROM wings_images WHERE wing_id IN (${ids.map(() => "?").join(",")}) ORDER BY sort_order ASC`,
      ids
    );
    for (const r of imgRows as any[]) {
      (imagesByWing[r.wing_id] ??= []).push(r.url);
    }
  }

  return NextResponse.json(wings.map((w) => ({
    id: w.id,
    categoryId: w.category_id,
    caption: w.caption,
    description: w.description,
    sortOrder: w.sort_order,
    images: imagesByWing[w.id] || [],
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  const id = b.id || "wing_" + Date.now();

  await db.query(
    `INSERT INTO wings (id, category_id, caption, description, sort_order)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), caption=VALUES(caption),
       description=VALUES(description), sort_order=VALUES(sort_order)`,
    [id, b.categoryId, b.caption || null, b.description || null, b.sortOrder ?? 0]
  );

  // Replace the image set with whatever the client submitted (simplest way to
  // support add/remove/reorder from the multi-image uploader in one save).
  const images: string[] = Array.isArray(b.images) ? b.images : [];
  await db.query("DELETE FROM wings_images WHERE wing_id=?", [id]);
  for (let i = 0; i < images.length; i++) {
    await db.query(
      "INSERT INTO wings_images (id, wing_id, url, sort_order) VALUES (?,?,?,?)",
      [`${id}_img_${i}_${Date.now()}`, id, images[i], i]
    );
  }

  return NextResponse.json({ ok: true, id });
}
