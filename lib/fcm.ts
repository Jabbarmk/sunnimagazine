import crypto from "crypto";
import db from "@/lib/db";

// Firebase Cloud Messaging sender — HTTP v1 API, no SDK dependency.
// Signs a service-account JWT with Node's crypto, exchanges it for an OAuth
// access token, then posts to FCM. Supports two targeting modes:
//   - Topics ("all", "emirate_<X>") — the app subscribes to these; used for
//     broadcasts (magazine publish, news, events, manual compose).
//   - Individual device tokens (device_tokens table) — used when a specific
//     set of users must be reached (e.g. expired/expiring subscribers), since
//     topics can't express "these particular users".
//
// Every send is logged to the `notifications` table (Notification Master
// history), including skipped sends when Firebase isn't configured yet.
//
// Configure via env FIREBASE_SERVICE_ACCOUNT = the full service-account JSON
// (one line). If unset, every send is a safe no-op so publishing never breaks.

type ServiceAccount = { project_id: string; client_email: string; private_key: string };

function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw);
    if (!sa.project_id || !sa.client_email || !sa.private_key) return null;
    return {
      project_id: sa.project_id,
      client_email: sa.client_email,
      private_key: String(sa.private_key).replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

export function isFcmConfigured(): boolean {
  return !!loadServiceAccount();
}

// Emirate -> FCM topic. Global/empty -> "all". Topics allow [a-zA-Z0-9-_.~%].
export function audienceToTopic(emirates?: string | null): string {
  const e = (emirates || "").trim();
  if (!e || e.toLowerCase() === "global" || e.toLowerCase() === "all") return "all";
  return "emirate_" + e.replace(/[^a-zA-Z0-9]+/g, "_");
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signingInput = `${header}.${claims}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(sa.private_key);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error("FCM auth failed: " + JSON.stringify(data));
  cachedToken = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

export type SendResult = { ok: true; id?: string } | { skipped: true; reason: string };

async function sendOne(
  target: { topic: string } | { token: string },
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendResult> {
  const sa = loadServiceAccount();
  if (!sa) return { skipped: true, reason: "FCM not configured" };

  const accessToken = await getAccessToken(sa);
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        ...target,
        notification: { title, body },
        data: data || {},
        android: { priority: "high", notification: { sound: "default" } },
        apns: { payload: { aps: { sound: "default" } } },
      },
    }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("FCM send failed: " + JSON.stringify(out));
  return { ok: true, id: out.name };
}

export async function sendToTopic(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendResult> {
  return sendOne({ topic }, title, body, data);
}

// Send to a list of device tokens, one FCM call per token (invalid/expired
// tokens fail individually and don't abort the rest of the batch).
export async function sendToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ sent: number; failed: number; skipped: boolean }> {
  if (!isFcmConfigured()) return { sent: 0, failed: 0, skipped: true };
  let sent = 0, failed = 0;
  for (const token of tokens) {
    try {
      await sendOne({ token }, title, body, data);
      sent++;
    } catch (e) {
      failed++;
      console.error("FCM token send failed:", e);
    }
  }
  return { sent, failed, skipped: false };
}

// Record every send attempt (Notification Master history), including skips.
export async function logNotification(entry: {
  title: string;
  body: string;
  target: string;
  type: string;
  status: "sent" | "failed" | "skipped";
  recipientCount?: number;
}) {
  try {
    await db.query(
      `INSERT INTO notifications (id,title,body,target,type,status,recipient_count)
       VALUES (?,?,?,?,?,?,?)`,
      [
        "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        entry.title, entry.body, entry.target, entry.type, entry.status,
        entry.recipientCount ?? null,
      ]
    );
  } catch (e) {
    console.error("Failed to log notification:", e);
  }
}

// Canonical topic send: sends (or safely skips) and always logs the result.
export async function notifyTopic(
  topic: string,
  title: string,
  body: string,
  type: string,
  data?: Record<string, string>
): Promise<SendResult> {
  if (!isFcmConfigured()) {
    await logNotification({ title, body, target: topic, type, status: "skipped" });
    return { skipped: true, reason: "FCM not configured" };
  }
  try {
    const result = await sendToTopic(topic, title, body, data);
    await logNotification({ title, body, target: topic, type, status: "sent" });
    return result;
  } catch (e) {
    await logNotification({ title, body, target: topic, type, status: "failed" });
    throw e;
  }
}

// Fire-and-forget helper for auto-notifications: never throws, never blocks the
// caller's success. Always logs (sent/failed/skipped) server-side.
export function notifyInBackground(topic: string, title: string, body: string, type: string, data?: Record<string, string>) {
  notifyTopic(topic, title, body, type, data).catch((e) => console.error("FCM notify failed:", e));
}
