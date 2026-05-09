import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get("all");
  const where = all ? "" : "WHERE is_published=1";
  const [rows] = await db.query(`SELECT * FROM magazines ${where} ORDER BY year DESC, FIELD(month,'December','November','October','September','August','July','June','May','April','March','February','January')`);
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r, articleIds: JSON.parse(r.article_ids || "[]"), isPublished: !!r.is_published,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO magazines (id,title,month,year,cover,description,article_ids,is_published)
     VALUES (?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title),month=VALUES(month),year=VALUES(year),cover=VALUES(cover),description=VALUES(description),article_ids=VALUES(article_ids)`,
    [b.id, b.title, b.month, b.year, b.cover, b.description, JSON.stringify(b.articleIds || []), b.isPublished ? 1 : 0]
  );
  return NextResponse.json({ ok: true });
}
