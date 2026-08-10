import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json([]);
  const [rows] = await db.query(
    "SELECT * FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC",
    [userId]
  );
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id,
    userId: r.user_id,
    amountAed: r.amount_aed,
    fromMonth: r.from_month,
    toMonth: r.to_month,
    paidDate: r.paid_date,
    createdAt: r.created_at,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO user_subscriptions (id,user_id,amount_aed,from_month,to_month,paid_date) VALUES (?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE amount_aed=VALUES(amount_aed),from_month=VALUES(from_month),to_month=VALUES(to_month),paid_date=VALUES(paid_date)`,
    [b.id, b.userId, b.amountAed, b.fromMonth, b.toMonth, b.paidDate || null]
  );

  // Resync app_users to whichever entry is now actually latest — not just
  // whatever was posted, since editing an older record shouldn't make it
  // look like the current one.
  const [latestRows] = await db.query(
    "SELECT from_month, to_month FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC LIMIT 1",
    [b.userId]
  );
  const latest = (latestRows as any[])[0];
  await db.query(
    "UPDATE app_users SET subscription_from=?, subscription_to=? WHERE id=?",
    [latest?.from_month ?? null, latest?.to_month ?? null, b.userId]
  );

  return NextResponse.json({ ok: true });
}
