import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT * FROM wings WHERE id=?", [params.id]);
  const w = (rows as any[])[0];
  if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [imgRows] = await db.query(
    "SELECT url FROM wings_images WHERE wing_id=? ORDER BY sort_order ASC",
    [params.id]
  );

  return NextResponse.json({
    id: w.id,
    categoryId: w.category_id,
    caption: w.caption,
    description: w.description,
    sortOrder: w.sort_order,
    images: (imgRows as any[]).map((r) => r.url),
  });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM wings_images WHERE wing_id=?", [params.id]);
  await db.query("DELETE FROM wings WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
