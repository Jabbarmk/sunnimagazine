import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT user_id FROM user_subscriptions WHERE id=?", [params.id]);
  const sub = (rows as any[])[0];

  await db.query("DELETE FROM user_subscriptions WHERE id=?", [params.id]);

  if (sub) {
    // Resync app_users to whatever subscription (if any) remains latest,
    // so its cached fields never point at a deleted history row.
    const [latestRows] = await db.query(
      "SELECT from_month, to_month FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC LIMIT 1",
      [sub.user_id]
    );
    const latest = (latestRows as any[])[0];
    await db.query(
      "UPDATE app_users SET subscription_from=?, subscription_to=? WHERE id=?",
      [latest?.from_month ?? null, latest?.to_month ?? null, sub.user_id]
    );
  }

  return NextResponse.json({ ok: true });
}
