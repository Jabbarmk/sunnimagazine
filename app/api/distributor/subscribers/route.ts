import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireDistributor } from "@/lib/distributorAuth";

const YM = /^\d{4}-\d{2}$/;

// A distributor updates a subscriber on THEIR OWN list. Only the day-to-day fields can
// change (expiry/start month, years, phone, address, remark); the subscriber code, name and
// owning distributor stay under the super admin's control. Adding/removing is admin-only.
export async function POST(req: Request) {
  const auth = await requireDistributor(req);
  if ("error" in auth) return auth.error;

  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Subscriber id is required" }, { status: 400 });
  if (!YM.test(b.expiryMonth || "")) return NextResponse.json({ error: "Expiry month is required (e.g. 2027-08)" }, { status: 400 });
  if (b.startMonth && !YM.test(b.startMonth)) return NextResponse.json({ error: "Invalid start month" }, { status: 400 });

  const [rows] = await db.query("SELECT id FROM distribution_subscribers WHERE id=? AND distributor_code=?", [id, auth.row.code]);
  if ((rows as any[]).length === 0) {
    return NextResponse.json({ error: "Subscriber not found on your list" }, { status: 404 });
  }

  const years = b.years === "" || b.years == null ? null : Number(b.years);
  await db.query(
    `UPDATE distribution_subscribers SET phone=?, address=?, start_month=?, expiry_month=?, years=?, remark=? WHERE id=? AND distributor_code=?`,
    [
      String(b.phone || "").trim().slice(0, 100) || null,
      String(b.address || "").trim().slice(0, 500) || null,
      b.startMonth || null,
      b.expiryMonth,
      Number.isFinite(years as number) ? years : null,
      String(b.remark || "").trim().slice(0, 255) || null,
      id, auth.row.code,
    ]
  );
  return NextResponse.json({ ok: true });
}
