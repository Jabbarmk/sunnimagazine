import { NextResponse } from "next/server";
import db from "@/lib/db";
import { notifyInBackground, audienceToTopic } from "@/lib/fcm";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM events ORDER BY created_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id, title: r.title, description: r.description,
    poster: r.poster, eventDate: r.event_date,
    emirates: r.emirates ?? "Global",
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  const [ex] = await db.query("SELECT id FROM events WHERE id=?", [b.id]);
  const isNew = !(ex as any[]).length;
  await db.query(
    `INSERT INTO events (id,title,description,poster,event_date,emirates)
     VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),poster=VALUES(poster),event_date=VALUES(event_date),emirates=VALUES(emirates)`,
    [b.id, b.title, b.description, b.poster, b.eventDate, b.emirates || "Global"]
  );
  if (isNew) {
    notifyInBackground(audienceToTopic(b.emirates), b.title, "New event", "event", { id: b.id });
  }
  return NextResponse.json({ ok: true });
}
