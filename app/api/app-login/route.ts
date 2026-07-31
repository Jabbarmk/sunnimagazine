import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { isSubscriptionExpired } from "@/lib/subscription";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();
  if (!identifier || !password) {
    return NextResponse.json({ error: "Required" }, { status: 400 });
  }
  const [rows] = await db.query(
    `SELECT id,name,email,mobile,password,location,photo,emirates,subscription_from,subscription_to,referred_by,referral_mobile
     FROM app_users
     WHERE (email=? OR mobile=?) AND is_active=1 AND deleted_at IS NULL
     LIMIT 1`,
    [identifier, identifier]
  );
  const u = (rows as any[])[0];
  if (!u) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const stored = String(u.password || "");
  const isBcryptHash = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
  let ok: boolean;
  if (isBcryptHash) {
    ok = await bcrypt.compare(password, stored);
  } else {
    // Legacy plaintext password — check directly, then self-heal to a
    // bcrypt hash on this successful login so no manual migration is needed.
    ok = password === stored;
    if (ok) {
      const hash = await bcrypt.hash(password, 10);
      await db.query("UPDATE app_users SET password=? WHERE id=?", [hash, u.id]);
    }
  }
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  // Always trust the latest subscription-history entry over the cached
  // fields on app_users (those can go stale — e.g. after a history row is
  // deleted). Fall back to the cached fields only for accounts whose
  // subscription was set directly without ever creating a history row.
  const [subRows] = await db.query(
    "SELECT from_month, to_month FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC LIMIT 1",
    [u.id]
  );
  const latestSub = (subRows as any[])[0];
  const subscriptionFrom = latestSub ? latestSub.from_month : u.subscription_from;
  const subscriptionTo = latestSub ? latestSub.to_month : u.subscription_to;

  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    location: u.location,
    photo: u.photo ?? "",
    emirates: u.emirates ?? "",
    subscriptionFrom: subscriptionFrom ?? "",
    subscriptionTo: subscriptionTo ?? "",
    // No subscription at all counts as "expired" here too — a user with
    // nothing set isn't entitled to subscriber access any more than a
    // lapsed one is.
    isExpired: !subscriptionTo || isSubscriptionExpired(subscriptionTo),
    referredBy: u.referred_by ?? "",
    referralMobile: u.referral_mobile ?? "",
  });
}
