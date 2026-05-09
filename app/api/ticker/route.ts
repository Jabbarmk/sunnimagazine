import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM ticker WHERE id=1");
    const r = (rows as any[])[0];
    if (!r) return NextResponse.json({ text: "", isEnabled: false });
    return NextResponse.json({ text: r.text ?? "", isEnabled: r.is_enabled === 1 });
  } catch {
    return NextResponse.json({ text: "", isEnabled: false });
  }
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO ticker (id, text, is_enabled) VALUES (1, ?, ?)
     ON DUPLICATE KEY UPDATE text=VALUES(text), is_enabled=VALUES(is_enabled)`,
    [b.text ?? "", b.isEnabled ? 1 : 0]
  );
  return NextResponse.json({ ok: true });
}
