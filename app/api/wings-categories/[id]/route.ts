import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // Cascade: delete this category's wing items and their images too.
  const [items] = await db.query("SELECT id FROM wings WHERE category_id=?", [params.id]);
  const ids = (items as any[]).map((r) => r.id);
  if (ids.length) {
    await db.query(`DELETE FROM wings_images WHERE wing_id IN (${ids.map(() => "?").join(",")})`, ids);
    await db.query("DELETE FROM wings WHERE category_id=?", [params.id]);
  }
  await db.query("DELETE FROM wings_categories WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
