import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();

  if (typeof b.isActive === "boolean") {
    await db.query("UPDATE app_users SET is_active=? WHERE id=?", [b.isActive ? 1 : 0, params.id]);
    return NextResponse.json({ ok: true });
  }

  if (b.softDelete) {
    // Block if subscription is still active
    const [rows] = await db.query("SELECT subscription_to FROM app_users WHERE id=?", [params.id]);
    const user = (rows as any[])[0];
    if (user?.subscription_to) {
      const expiry = new Date(user.subscription_to);
      if (expiry > new Date()) {
        return NextResponse.json(
          { error: "Cannot delete user with active subscription. Subscription expires " + user.subscription_to },
          { status: 400 }
        );
      }
    }
    await db.query("UPDATE app_users SET deleted_at=NOW() WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  }

  // General update (subscriptionFrom/To sync after adding subscription)
  if (b.subscriptionFrom !== undefined || b.subscriptionTo !== undefined) {
    await db.query(
      "UPDATE app_users SET subscription_from=?, subscription_to=? WHERE id=?",
      [b.subscriptionFrom || null, b.subscriptionTo || null, params.id]
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown update" }, { status: 400 });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM app_users WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
