import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM arts ORDER BY created_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r,
    magazineId: r.magazine_id,
    artCategoryId: r.art_category_id,
    artCategoryName: r.art_category_name,
    authorId: r.author_id,
    authorName: r.author_name,
    authorAvatar: r.author_avatar,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO arts (id,magazine_id,art_category_id,art_category_name,author_id,author_name,author_avatar,title,image,description)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE magazine_id=VALUES(magazine_id),art_category_id=VALUES(art_category_id),
       art_category_name=VALUES(art_category_name),author_id=VALUES(author_id),author_name=VALUES(author_name),
       author_avatar=VALUES(author_avatar),title=VALUES(title),image=VALUES(image),description=VALUES(description)`,
    [b.id, b.magazineId, b.artCategoryId, b.artCategoryName, b.authorId || null,
     b.authorName || null, b.authorAvatar || null, b.title, b.image || null, b.description || null]
  );
  return NextResponse.json({ ok: true });
}
