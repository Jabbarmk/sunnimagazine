import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM slides ORDER BY sort_order ASC, created_at DESC");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO slides (id,image,poster,title,details,website,contact)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE image=VALUES(image),poster=VALUES(poster),title=VALUES(title),details=VALUES(details),website=VALUES(website),contact=VALUES(contact)`,
    [b.id, b.image, b.poster || null, b.title, b.details, b.website, b.contact]
  );
  return NextResponse.json({ ok: true });
}
