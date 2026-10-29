import { NextResponse } from "next/server";
import db from "@/lib/db";

const YM = /^\d{4}-\d{2}$/;

// Create (no id) or update (id) a subscriber on a distributor's list.
export async function POST(req: Request) {
  const b = await req.json();
  const distributorCode = Number(b.distributorCode);
  const subCode = Number(b.subCode);
  const name = String(b.name || "").trim();
  if (!Number.isInteger(distributorCode)) return NextResponse.json({ error: "Distributor is required" }, { status: 400 });
  if (!Number.isInteger(subCode) || subCode <= 0) return NextResponse.json({ error: "Subscriber code must be a positive number" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!YM.test(b.expiryMonth || "")) return NextResponse.json({ error: "Expiry month is required (e.g. Aug/27)" }, { status: 400 });
  if (b.startMonth && !YM.test(b.startMonth)) return NextResponse.json({ error: "Invalid start month" }, { status: 400 });

  const [dist] = await db.query("SELECT code FROM distribution_distributors WHERE code=?", [distributorCode]);
  if ((dist as any[]).length === 0) return NextResponse.json({ error: "Distributor not found" }, { status: 404 });

  const [dup] = await db.query("SELECT id FROM distribution_subscribers WHERE sub_code=? AND id<>?", [subCode, b.id ?? 0]);
  if ((dup as any[]).length > 0) {
    return NextResponse.json({ error: `Subscriber code ${subCode} already exists` }, { status: 409 });
  }

  const years = b.years === "" || b.years == null ? null : Number(b.years);
  const vals = [
    distributorCode, subCode, name, b.phone?.trim() || null, b.address?.trim() || null,
    b.startMonth || null, b.expiryMonth, Number.isFinite(years as number) ? years : null,
  ];
  if (b.id) {
    await db.query(
      `UPDATE distribution_subscribers SET distributor_code=?, sub_code=?, name=?, phone=?, address=?,
         start_month=?, expiry_month=?, years=? WHERE id=?`,
      [...vals, b.id]
    );
  } else {
    await db.query(
      `INSERT INTO distribution_subscribers (distributor_code,sub_code,name,phone,address,start_month,expiry_month,years)
       VALUES (?,?,?,?,?,?,?,?)`,
      vals
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.query("DELETE FROM distribution_subscribers WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
