import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM app_users");
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r,
    subscriptionFrom: r.subscription_from,
    subscriptionTo: r.subscription_to,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO app_users (id,name,email,password,mobile,location,photo,subscription_from,subscription_to)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE name=VALUES(name),email=VALUES(email),password=VALUES(password),
       mobile=VALUES(mobile),location=VALUES(location),photo=VALUES(photo),
       subscription_from=VALUES(subscription_from),subscription_to=VALUES(subscription_to)`,
    [b.id, b.name, b.email, b.password, b.mobile, b.location, b.photo, b.subscriptionFrom, b.subscriptionTo]
  );
  return NextResponse.json({ ok: true });
}
