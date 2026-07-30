import { NextResponse } from "next/server";
import db from "@/lib/db";

// Notification Master history — every send attempt (manual, magazine, news,
// event, expired/expiring reminders), including skipped ones.
export const dynamic = "force-dynamic"; // avoid build-time prerender querying the DB
export async function GET() {
  const [rows] = await db.query(
    "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 200"
  );
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    target: r.target,
    type: r.type,
    status: r.status,
    recipientCount: r.recipient_count,
    createdAt: r.created_at,
  })));
}
