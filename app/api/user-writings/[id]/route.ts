import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  await db.query("UPDATE user_writings SET status=? WHERE id=?", [b.status, params.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.query("DELETE FROM user_writings WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
