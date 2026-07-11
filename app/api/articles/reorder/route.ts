import { NextResponse } from "next/server";
import db from "@/lib/db";

// Persist a drag-and-drop reorder: `ids` is a magazine's article ids in the
// desired order; each gets sort_order = its 1-based position.
export async function POST(req: Request) {
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }
  for (let i = 0; i < ids.length; i++) {
    await db.query("UPDATE articles SET sort_order=? WHERE id=?", [i + 1, ids[i]]);
  }
  return NextResponse.json({ ok: true });
}
