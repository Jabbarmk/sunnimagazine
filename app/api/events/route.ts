import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM events ORDER BY created_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id, title: r.title, description: r.description,
    poster: r.poster, eventDate: r.event_date,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO events (id,title,description,poster,event_date)
     VALUES (?,?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),poster=VALUES(poster),event_date=VALUES(event_date)`,
    [b.id, b.title, b.description, b.poster, b.eventDate]
  );
  return NextResponse.json({ ok: true });
}
