import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId");
  if (articleId) {
    const [rows] = await db.query("SELECT * FROM galleries WHERE article_id=?", [articleId]);
    return NextResponse.json((rows as any[]).map((r) => ({ id: r.id, url: r.url })));
  }
  const [rows] = await db.query("SELECT * FROM galleries");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    "INSERT INTO galleries (id,article_id,url) VALUES (?,?,?) ON DUPLICATE KEY UPDATE url=VALUES(url)",
    [b.id, b.articleId, b.url]
  );
  return NextResponse.json({ ok: true });
}
