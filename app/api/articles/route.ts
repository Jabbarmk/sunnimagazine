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

export async function GET() {
  const [rows] = await db.query("SELECT * FROM articles ORDER BY created_at DESC");
  const articles = (rows as any[]).map((r) => ({
    ...r,
    paragraphs: JSON.parse(r.paragraphs || "[]"),
    magazineId: r.magazine_id,
    readTime: r.read_time,
    inlineImage: r.inline_image,
    inlineImage2: r.inline_image2,
    bottomImage: r.bottom_image,
    pullQuotes: parsePullQuotes(r.pull_quote),
  }));
  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const b = await req.json();
  const pq = b.pullQuotes?.length ? JSON.stringify(b.pullQuotes) : null;
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
