import { NextResponse } from "next/server";
import db from "@/lib/db";

// Firebase Admin SDK service account, editable from the dashboard so no SSH
// access is needed to configure push notifications.
export const dynamic = "force-dynamic"; // avoid build-time prerender querying the DB
export async function GET() {
  const [rows] = await db.query("SELECT service_account_json FROM firebase_settings WHERE id=1");
  const raw = (rows as any[])[0]?.service_account_json ?? "";
  let projectId = "";
  let clientEmail = "";
  if (raw) {
    try {
      const sa = JSON.parse(raw);
      projectId = sa.project_id ?? "";
      clientEmail = sa.client_email ?? "";
    } catch {
      // malformed JSON in DB — surfaced as configured:false below
    }
  }
  return NextResponse.json({
    serviceAccountJson: raw,
    configured: !!(projectId && clientEmail),
    projectId,
    clientEmail,
  });
}

export async function POST(req: Request) {
  const { serviceAccountJson } = await req.json();
  const raw = (serviceAccountJson ?? "").trim();

  if (raw) {
    let sa: any;
    try {
      sa = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "That's not valid JSON. Paste the entire downloaded file content." }, { status: 400 });
    }
    if (!sa.project_id || !sa.client_email || !sa.private_key) {
      return NextResponse.json(
        { error: "Missing project_id, client_email, or private_key — make sure you copied the whole file." },
        { status: 400 }
      );
    }
  }

  await db.query(
    `INSERT INTO firebase_settings (id, service_account_json) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE service_account_json=VALUES(service_account_json)`,
    [raw || null]
  );
  return NextResponse.json({ ok: true });
}
