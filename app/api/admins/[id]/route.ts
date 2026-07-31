import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const requesterId = searchParams.get("requesterId");

  if (requesterId && requesterId === params.id) {
    return NextResponse.json({ error: "You can't delete your own account while logged in." }, { status: 400 });
  }

  const [rows] = await db.query("SELECT role FROM admins WHERE id=?", [params.id]);
  const target = (rows as any[])[0];
  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  if (target.role === "super_admin") {
    const [countRows] = await db.query("SELECT COUNT(*) AS c FROM admins WHERE role='super_admin'");
    if ((countRows as any[])[0].c <= 1) {
      return NextResponse.json({ error: "Can't delete the last Super Admin." }, { status: 400 });
    }
  }

  await db.query("DELETE FROM admins WHERE id=?", [params.id]);
  return NextResponse.json({ ok: true });
}
