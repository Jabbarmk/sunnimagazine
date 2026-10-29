import { NextResponse } from "next/server";
import db from "@/lib/db";

// Create (isNew) or update a distributor. `code` is the distributor number and
// can't be changed once created, since subscribers reference it.
export async function POST(req: Request) {
  const b = await req.json();
  const code = Number(b.code);
  const name = String(b.name || "").trim();
  if (!Number.isInteger(code) || code <= 0) {
    return NextResponse.json({ error: "Distributor code must be a positive number" }, { status: 400 });
  }
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  if (b.isNew) {
    const [dup] = await db.query("SELECT code FROM distribution_distributors WHERE code=?", [code]);
    if ((dup as any[]).length > 0) {
      return NextResponse.json({ error: `Distributor ${code} already exists` }, { status: 409 });
    }
    await db.query(
      "INSERT INTO distribution_distributors (code,name,phone,state,area) VALUES (?,?,?,?,?)",
      [code, name, b.phone?.trim() || null, b.state?.trim() || "DUBAI", b.area?.trim() || null]
    );
  } else {
    await db.query(
      "UPDATE distribution_distributors SET name=?, phone=?, state=?, area=? WHERE code=?",
      [name, b.phone?.trim() || null, b.state?.trim() || "DUBAI", b.area?.trim() || null, code]
    );
  }
  return NextResponse.json({ ok: true });
}

// Deleting a distributor also deletes their subscriber rows (FK cascade).
export async function DELETE(req: Request) {
  const code = Number(new URL(req.url).searchParams.get("code"));
  if (!Number.isInteger(code)) return NextResponse.json({ error: "code required" }, { status: 400 });
  await db.query("DELETE FROM distribution_distributors WHERE code=?", [code]);
  return NextResponse.json({ ok: true });
}
