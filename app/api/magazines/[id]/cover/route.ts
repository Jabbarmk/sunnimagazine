import { NextResponse } from "next/server";
import db from "@/lib/db";

// Serves a magazine cover as an actual image (decoded from the base64 stored in
// the DB) so the browser can lazy-load and cache it, instead of shipping every
// cover inside the magazines JSON list.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT cover FROM magazines WHERE id=?", [params.id]);
  const cover = (rows as any[])[0]?.cover as string | undefined;
  if (!cover) return new NextResponse(null, { status: 404 });

  // Plain URL cover -> redirect to it.
  if (!cover.startsWith("data:")) {
    return NextResponse.redirect(cover);
  }

  const m = cover.match(/^data:([^;]+);base64,(.*)$/s);
  if (!m) return new NextResponse(null, { status: 404 });

  const buffer = Buffer.from(m[2], "base64");
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": m[1] || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
