import { NextResponse } from "next/server";
import { notifyTopic, audienceToTopic } from "@/lib/fcm";

// Manual push from the dashboard. `target` is "all" or an emirate name.
// `type` labels the source in Notification Master history (default "manual";
// the magazine "Notify" button passes "magazine").
export async function POST(req: Request) {
  const { title, body, target, type } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }
  const topic = audienceToTopic(target);
  try {
    // notifyTopic always logs the attempt (sent/failed/skipped), even when
    // Firebase isn't configured — Notification Master must record every send.
    const result = await notifyTopic(topic, title.trim(), body.trim(), type || "manual", { type: type || "manual" });
    if ("skipped" in result) {
      return NextResponse.json(
        { error: "Push notifications are not configured on the server yet (FIREBASE_SERVICE_ACCOUNT missing)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, topic, result });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send failed" }, { status: 500 });
  }
}
