import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT * FROM magazines WHERE id=?", [params.id]);
  const r = (rows as any[])[0];
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...r, articleIds: JSON.parse(r.article_ids || "[]"), isPublished: !!r.is_published });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  if (typeof b.isPublished === "boolean") {
    await db.query("UPDATE magazines SET is_published=? WHERE id=?", [b.isPublished ? 1 : 0, params.id]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM magazines WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
