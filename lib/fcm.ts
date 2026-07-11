import crypto from "crypto";

// Firebase Cloud Messaging sender — HTTP v1 API, no SDK dependency.
// Signs a service-account JWT with Node's crypto, exchanges it for an OAuth
// access token, then posts to FCM. Sends to TOPICS (the app subscribes to
// "all" and "emirate_<X>"), so no device-token database is needed.
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

export async function sendToTopic(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendResult> {
  const sa = loadServiceAccount();
  if (!sa) return { skipped: true, reason: "FCM not configured" };

  const token = await getAccessToken(sa);
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        topic,
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

// Fire-and-forget helper for auto-notifications: never throws, never blocks the
// caller's success. Logs failures server-side.
export function notifyInBackground(topic: string, title: string, body: string, data?: Record<string, string>) {
  if (!isFcmConfigured()) return;
  sendToTopic(topic, title, body, data).catch((e) => console.error("FCM notify failed:", e));
}
