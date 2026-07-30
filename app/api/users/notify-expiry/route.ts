import { NextResponse } from "next/server";
import db from "@/lib/db";
import { sendToTokens, logNotification, isFcmConfigured } from "@/lib/fcm";

function subStatus(to: string): "expired" | "expiring" | "active" | "none" {
  if (!to) return "none";
  const days = Math.ceil((new Date(to + "-01").getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "active";
}

function fmtMonth(val: string): string {
  if (!val) return "";
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m] = val.split("-");
  const idx = parseInt(m) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${y}` : val;
}

// Sends a personalized push (via device_tokens, not a topic) to every user
// whose subscription is expired or expiring within 30 days. `bodyTemplate`
// supports {name} and {expiry} placeholders, filled in per recipient.
export async function POST(req: Request) {
  const { type, title, bodyTemplate } = await req.json();
  if (type !== "expired" && type !== "expiring") {
    return NextResponse.json({ error: "type must be 'expired' or 'expiring'" }, { status: 400 });
  }
  if (!title?.trim() || !bodyTemplate?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }
  if (!(await isFcmConfigured())) {
    await logNotification({ title, body: bodyTemplate, target: `${type}-users`, type, status: "skipped" });
    return NextResponse.json(
      { error: "Push notifications are not configured yet. Add your Firebase service account in Settings first." },
      { status: 503 }
    );
  }

  const [rows] = await db.query(
    "SELECT id, name, subscription_to FROM app_users WHERE deleted_at IS NULL AND subscription_to IS NOT NULL AND subscription_to <> ''"
  );
  const matched = (rows as any[]).filter((u) => subStatus(u.subscription_to) === type);

  let usersWithTokens = 0, tokensSent = 0, tokensFailed = 0;
  for (const u of matched) {
    const [tokRows] = await db.query("SELECT token FROM device_tokens WHERE user_id=?", [u.id]);
    const tokens = (tokRows as any[]).map((t) => t.token);
    if (tokens.length === 0) continue;
    usersWithTokens++;

    const personalizedBody = bodyTemplate
      .replace(/\{name\}/g, u.name || "")
      .replace(/\{expiry\}/g, fmtMonth(u.subscription_to));

    const result = await sendToTokens(tokens, title.trim(), personalizedBody, { type });
    tokensSent += result.sent;
    tokensFailed += result.failed;
  }

  await logNotification({
    title: title.trim(),
    body: bodyTemplate.trim(),
    target: `${type}-users`,
    type,
    status: tokensSent > 0 ? "sent" : matched.length > 0 ? "failed" : "sent",
    recipientCount: tokensSent,
  });

  return NextResponse.json({
    ok: true,
    usersMatched: matched.length,
    usersWithTokens,
    tokensSent,
    tokensFailed,
  });
}
