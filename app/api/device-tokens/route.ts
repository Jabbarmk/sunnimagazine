import { NextResponse } from "next/server";
import db from "@/lib/db";

// Registers (or refreshes) a device's FCM token against a user id, so the
// server can push to that specific user later (e.g. expired/expiring
// subscription reminders) — topics alone can't target individual users.
// Call this from the Flutter app after login and whenever FCM issues a new
// token (onTokenRefresh).
export async function POST(req: Request) {
  const { userId, token, platform } = await req.json();
  if (!userId?.trim() || !token?.trim()) {
    return NextResponse.json({ error: "userId and token are required" }, { status: 400 });
  }
  await db.query(
    `INSERT INTO device_tokens (id, user_id, token, platform)
     VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE user_id=VALUES(user_id), platform=VALUES(platform), updated_at=CURRENT_TIMESTAMP`,
    ["dt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7), userId.trim(), token.trim(), platform || null]
  );
  return NextResponse.json({ ok: true });
}

// Remove a token (e.g. on logout) so it stops receiving pushes for that user.
export async function DELETE(req: Request) {
  const { token } = await req.json();
  if (!token?.trim()) return NextResponse.json({ error: "token is required" }, { status: 400 });
  await db.query("DELETE FROM device_tokens WHERE token=?", [token.trim()]);
  return NextResponse.json({ ok: true });
}
