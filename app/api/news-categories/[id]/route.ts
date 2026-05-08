import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM news_categories WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
