import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deleted = searchParams.get("deleted") === "1";
  const sql = deleted
    ? "SELECT * FROM app_users WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC"
    : "SELECT * FROM app_users WHERE deleted_at IS NULL ORDER BY created_at DESC";
  const [rows] = await db.query(sql);
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    password: r.password,
    mobile: r.mobile,
    location: r.location,
    photo: r.photo,
    subscriptionFrom: r.subscription_from ?? "",
    subscriptionTo: r.subscription_to ?? "",
    referredBy: r.referred_by ?? "",
    referralMobile: r.referral_mobile ?? "",
    isActive: r.is_active === 1 || r.is_active === true,
    deletedAt: r.deleted_at ?? null,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO app_users (id,name,email,password,mobile,location,photo,subscription_from,subscription_to,referred_by,referral_mobile,is_active)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
     ON DUPLICATE KEY UPDATE name=VALUES(name),email=VALUES(email),password=VALUES(password),
       mobile=VALUES(mobile),location=VALUES(location),photo=VALUES(photo),
       subscription_from=VALUES(subscription_from),subscription_to=VALUES(subscription_to),
       referred_by=VALUES(referred_by),referral_mobile=VALUES(referral_mobile)`,
    [b.id, b.name, b.email, b.password, b.mobile, b.location, b.photo ?? null,
     b.subscriptionFrom || null, b.subscriptionTo || null, b.referredBy || null, b.referralMobile || null]
  );
  return NextResponse.json({ ok: true });
}
