import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get("all");
  const where = all ? "" : "WHERE m.is_published=1";
  // article_count is computed in SQL so list views don't have to download articles.
  const [rows] = await db.query(
    `SELECT m.*, (SELECT COUNT(*) FROM articles a WHERE a.magazine_id = m.id) AS article_count
     FROM magazines m ${where}
     ORDER BY m.year DESC, FIELD(m.month,'December','November','October','September','August','July','June','May','April','March','February','January')`
  );
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r, articleIds: JSON.parse(r.article_ids || "[]"), isPublished: !!r.is_published,
    articleCount: Number(r.article_count) || 0,
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
