import { NextResponse } from "next/server";
import db from "@/lib/db";

// Serves an article's hero as a real (cacheable) image, decoded from the base64
// stored in the DB — so list views can show thumbnails via <img> / Image.network
// without shipping every image inside the article JSON.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [rows] = await db.query("SELECT hero FROM articles WHERE id=?", [params.id]);
  const hero = (rows as any[])[0]?.hero as string | undefined;
  if (!hero) return new NextResponse(null, { status: 404 });

  // Plain URL hero -> redirect to it.
  if (!hero.startsWith("data:")) {
    return NextResponse.redirect(hero);
  }

  const m = hero.match(/^data:([^;]+);base64,(.*)$/s);
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
