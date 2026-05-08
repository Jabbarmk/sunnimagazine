import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT * FROM news WHERE id=?", [params.id]);
  const r = (rows as any[])[0];
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: r.id,
    categoryId: r.category_id,
    categoryName: r.category_name,
    title: r.title,
    description: r.description,
    image: r.image,
    source: r.source,
    publishedAt: r.published_at,
  });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM news WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
