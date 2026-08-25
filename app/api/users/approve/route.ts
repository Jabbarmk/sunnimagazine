import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// No ambiguous characters (0/O, 1/l/I) — the password gets read out of an
// email or over WhatsApp, so every character must be unmistakable.
const PASSWORD_CHARSET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generatePassword(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARSET[crypto.randomInt(PASSWORD_CHARSET.length)];
  }
  return out;
}

// Approve a new registration: record their first subscription and, if they
// have no password yet (app signups store NULL), generate one so they can
// log in. The plaintext is returned once so the dashboard can email it.
export async function POST(req: Request) {
  const { userId, amountAed, fromMonth, toMonth, paidDate } = await req.json();
  if (!userId || amountAed === undefined || amountAed === null || amountAed === "" || !fromMonth || !toMonth) {
    return NextResponse.json({ error: "userId, amountAed, fromMonth and toMonth are required" }, { status: 400 });
  }

  const [rows] = await db.query(
    "SELECT id, name, email, mobile, password FROM app_users WHERE id=? AND deleted_at IS NULL",
    [userId]
  );
  const user = (rows as any[])[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const subscriptionId = "sub_" + Date.now();
  await db.query(
    "INSERT INTO user_subscriptions (id,user_id,amount_aed,from_month,to_month,paid_date) VALUES (?,?,?,?,?,?)",
    [subscriptionId, userId, amountAed, fromMonth, toMonth, paidDate || null]
  );

  // Resync the cached fields to whichever entry is actually latest, matching
  // the behavior of the regular subscription-save endpoint.
  const [latestRows] = await db.query(
    "SELECT from_month, to_month FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC LIMIT 1",
    [userId]
  );
  const latest = (latestRows as any[])[0];
  await db.query(
    "UPDATE app_users SET subscription_from=?, subscription_to=? WHERE id=?",
    [latest?.from_month ?? null, latest?.to_month ?? null, userId]
  );

  let generatedPassword: string | null = null;
  if (!user.password || String(user.password).length === 0) {
    generatedPassword = generatePassword();
    const hash = await bcrypt.hash(generatedPassword, 10);
    await db.query("UPDATE app_users SET password=? WHERE id=?", [hash, userId]);
  }

  return NextResponse.json({
    ok: true,
    subscriptionId,
    generatedPassword,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile ?? "" },
  });
}
