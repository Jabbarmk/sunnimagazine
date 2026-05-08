import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { identifier, password } = await req.json();
  if (!identifier || !password) {
    return NextResponse.json({ error: "Required" }, { status: 400 });
  }
  const [rows] = await db.query(
    "SELECT * FROM app_users WHERE (email=? OR mobile=?) AND password=? LIMIT 1",
    [identifier, identifier, password]
  );
  const u = (rows as any[])[0];
  if (!u) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  return NextResponse.json({
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    location: u.location,
    photo: u.photo ?? "",
    subscriptionFrom: u.subscription_from ?? "",
    subscriptionTo: u.subscription_to ?? "",
    referredBy: u.referred_by ?? "",
    referralMobile: u.referral_mobile ?? "",
  });
}
