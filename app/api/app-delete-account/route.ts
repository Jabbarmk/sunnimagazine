import { NextResponse } from "next/server";
import db from "@/lib/db";

// Self-service account deletion for signed-in app users.
// Soft delete: sets deleted_at + deactivates so the user can no longer log in
// (app-login requires is_active=1 AND deleted_at IS NULL) while the admin
// still sees them in the deleted-users list.
export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  const [rows] = await db.query(
    "SELECT id FROM app_users WHERE id=? AND deleted_at IS NULL LIMIT 1",
    [id]
  );
  if (!(rows as any[])[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.query(
    "UPDATE app_users SET deleted_at=NOW(), is_active=0 WHERE id=?",
    [id]
  );
  return NextResponse.json({ ok: true });
}
