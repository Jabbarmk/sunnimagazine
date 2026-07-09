import { NextResponse } from "next/server";
import db from "@/lib/db";
import { emirateVisible } from "@/lib/emirates";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId");
  const [rows] = await db.query("SELECT * FROM slides ORDER BY sort_order ASC, created_at DESC");
  let list = rows as any[];
  // No userId (dashboard) → return all. With userId → filter by that user's emirate.
  if (userId) {
    const [u] = await db.query("SELECT emirates FROM app_users WHERE id=?", [userId]);
    const userEmirate = (u as any[])[0]?.emirates ?? "";
    list = list.filter((s) => emirateVisible(userEmirate, s.emirates));
  }
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO slides (id,image,poster,title,details,website,contact,sort_order,emirates)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE image=VALUES(image),poster=VALUES(poster),title=VALUES(title),
       details=VALUES(details),website=VALUES(website),contact=VALUES(contact),sort_order=VALUES(sort_order),
       emirates=VALUES(emirates)`,
    [b.id, b.image, b.poster || null, b.title, b.details, b.website, b.contact, b.sortOrder ?? 0, b.emirates || "Global"]
  );
  return NextResponse.json({ ok: true });
}
