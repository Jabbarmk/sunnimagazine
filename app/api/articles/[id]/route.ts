import { NextResponse } from "next/server";
import db from "@/lib/db";

function parsePullQuotes(raw: string | null) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p;
    return [{ text: String(raw), afterParagraph: 3 }];
  } catch {
    return [{ text: raw, afterParagraph: 3 }];
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT * FROM articles WHERE id=?", [params.id]);
  const r = (rows as any[])[0];
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...r,
    paragraphs: JSON.parse(r.paragraphs || "[]"),
    magazineId: r.magazine_id,
    readTime: r.read_time,
    inlineImage: r.inline_image,
    inlineImage2: r.inline_image2,
    bottomImage: r.bottom_image,
    pullQuotes: parsePullQuotes(r.pull_quote),
  });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM articles WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
