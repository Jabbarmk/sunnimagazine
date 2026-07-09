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

// Numeric value of an id like "a11" -> 11, for ordering small-to-large.
function idNum(id: string) {
  const m = String(id).match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER;
}

const byId = (a: { id: string }, b: { id: string }) =>
  idNum(a.id) - idNum(b.id) || String(a.id).localeCompare(String(b.id));

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const magazineId = searchParams.get("magazineId");
  const list = searchParams.get("list");

  // Filter on the server so a client never downloads other magazines' articles.
  const where = magazineId ? "WHERE magazine_id=?" : "";
  const args = magazineId ? [magazineId] : [];

  // Light mode: only the columns a list view needs — skips the heavy
  // base64 images and paragraph bodies that bloat the payload.
  if (list) {
    const [rows] = await db.query(
      `SELECT id, magazine_id, title, category, author, date FROM articles ${where}`,
      args
    );
    const items = (rows as any[])
      .map((r) => ({
        id: r.id,
        magazineId: r.magazine_id,
        title: r.title,
        category: r.category,
        author: r.author,
        date: r.date,
      }))
      .sort(byId);
    return NextResponse.json(items);
  }

  const [rows] = await db.query(`SELECT * FROM articles ${where}`, args);
  const articles = (rows as any[])
    .map((r) => ({
      ...r,
      paragraphs: JSON.parse(r.paragraphs || "[]"),
      magazineId: r.magazine_id,
      readTime: r.read_time,
      inlineImage: r.inline_image,
      inlineImage2: r.inline_image2,
      bottomImage: r.bottom_image,
      pullQuotes: parsePullQuotes(r.pull_quote),
    }))
    .sort(byId);
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const b = await req.json();
  const pq = b.pullQuotes?.length ? JSON.stringify(b.pullQuotes) : null;

  // Editing an existing article and changing its ID = rename the primary key.
  // Move the row and update everything that references the old id.
  if (b.originalId && b.originalId !== b.id) {
    const [taken] = await db.query("SELECT id FROM articles WHERE id=?", [b.id]);
    if ((taken as any[]).length) {
      return NextResponse.json({ error: "Article ID already in use" }, { status: 409 });
    }
    await db.query("UPDATE articles SET id=? WHERE id=?", [b.id, b.originalId]);
    await db.query("UPDATE galleries SET article_id=? WHERE article_id=?", [b.id, b.originalId]);
    await db.query(
      "UPDATE magazines SET article_ids = REPLACE(article_ids, ?, ?) WHERE article_ids LIKE ?",
      [`"${b.originalId}"`, `"${b.id}"`, `%"${b.originalId}"%`]
    );
  }

  await db.query(
    `INSERT INTO articles (id,magazine_id,title,caption,category,author,avatar,date,read_time,hero,paragraphs,inline_image,inline_image2,bottom_image,pull_quote)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       magazine_id=VALUES(magazine_id),title=VALUES(title),caption=VALUES(caption),
       category=VALUES(category),author=VALUES(author),avatar=VALUES(avatar),
       date=VALUES(date),read_time=VALUES(read_time),hero=VALUES(hero),
       paragraphs=VALUES(paragraphs),inline_image=VALUES(inline_image),
       inline_image2=VALUES(inline_image2),bottom_image=VALUES(bottom_image),
       pull_quote=VALUES(pull_quote)`,
    [b.id, b.magazineId, b.title, b.caption, b.category, b.author, b.avatar,
     b.date, b.readTime, b.hero, JSON.stringify(b.paragraphs || []),
     b.inlineImage || null, b.inlineImage2 || null, b.bottomImage || null, pq]
  );
  return NextResponse.json({ ok: true });
}
