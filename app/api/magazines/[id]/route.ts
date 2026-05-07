import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT * FROM magazines WHERE id=?", [params.id]);
  const r = (rows as any[])[0];
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...r, articleIds: JSON.parse(r.article_ids || "[]") });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM magazines WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
