import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM news_categories");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    "INSERT INTO news_categories (id,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
    [b.id, b.name]
  );
  return NextResponse.json({ ok: true });
}
