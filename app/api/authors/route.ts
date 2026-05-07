import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM authors");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    "INSERT INTO authors (id,name,avatar) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),avatar=VALUES(avatar)",
    [b.id, b.name, b.avatar]
  );
  return NextResponse.json({ ok: true });
}
