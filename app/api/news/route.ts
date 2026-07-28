import { NextResponse } from "next/server";
import db from "@/lib/db";
import { notifyInBackground, audienceToTopic } from "@/lib/fcm";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM news ORDER BY created_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    categoryName: r.category_name,
    title: r.title,
    description: r.description,
    image: r.image,
    source: r.source,
    publishedAt: r.published_at,
    emirates: r.emirates ?? "Global",
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  // Only notify when this is a brand-new item, not an edit.
  const [ex] = await db.query("SELECT id FROM news WHERE id=?", [b.id]);
  const isNew = !(ex as any[]).length;
  await db.query(
    `INSERT INTO news (id,category_id,category_name,title,description,image,source,published_at,emirates)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       category_id=VALUES(category_id),category_name=VALUES(category_name),
       title=VALUES(title),description=VALUES(description),
       image=VALUES(image),source=VALUES(source),published_at=VALUES(published_at),
       emirates=VALUES(emirates)`,
    [b.id, b.categoryId, b.categoryName, b.title, b.description, b.image, b.source, b.publishedAt, b.emirates || "Global"]
  );
  if (isNew) {
    notifyInBackground(audienceToTopic(b.emirates), b.title, b.categoryName || "New update", "news", { id: b.id });
  }
  return NextResponse.json({ ok: true });
}
