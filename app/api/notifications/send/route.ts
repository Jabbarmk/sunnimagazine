import { NextResponse } from "next/server";
import { sendToTopic, audienceToTopic, isFcmConfigured } from "@/lib/fcm";

// Manual push from the dashboard. `target` is "all" or an emirate name.
export async function POST(req: Request) {
  const { title, body, target } = await req.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }
  if (!isFcmConfigured()) {
    return NextResponse.json(
      { error: "Push notifications are not configured on the server yet (FIREBASE_SERVICE_ACCOUNT missing)." },
      { status: 503 }
    );
  }
  const topic = audienceToTopic(target);
  try {
    const result = await sendToTopic(topic, title.trim(), body.trim(), { type: "broadcast" });
    return NextResponse.json({ ok: true, topic, result });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send failed" }, { status: 500 });
  }
}
