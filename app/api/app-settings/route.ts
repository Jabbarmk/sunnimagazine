import { NextResponse } from "next/server";
import db from "@/lib/db";

// General app-wide settings (currently just the logo). Public GET — used by
// both the dashboard and the Flutter app to fetch the current logo URL.
//
// force-dynamic: without this, `next build` attempts to statically
// pre-render this route and queries app_settings at BUILD time. If that
// table doesn't exist yet on a fresh deploy, the build throws and can
// corrupt unrelated pages (this bit us once already with /api/notifications
// before its migration had run). This makes a missing table a normal
// runtime 500 for this route only, never a build failure.
export const dynamic = "force-dynamic";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM app_settings WHERE id=1");
  const r = (rows as any[])[0];
  return NextResponse.json({ logo: r?.logo || "" });
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO app_settings (id, logo) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE logo=VALUES(logo)`,
    [b.logo || null]
  );
  return NextResponse.json({ ok: true });
}
