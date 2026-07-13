import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Fallback file server for /uploads/* (PDFs, videos, etc.).
//
// `next start` snapshots the public/ file listing at process startup, so
// files our upload endpoints write to public/uploads/* AFTER the server has
// booted 404 until the next restart. This route reads straight from disk on
// every request instead, so uploads are servable immediately, no restart
// needed. Safe alongside Next's normal static serving — this only ever runs
// as the fallback for paths Next's static handler didn't recognize.
const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_: Request, { params }: { params: { path: string[] } }) {
  const segments = params.path || [];
  if (segments.some((s) => s === ".." || s.includes("\\") || s.includes("/"))) {
    return new NextResponse(null, { status: 400 });
  }

  const filePath = path.join(UPLOADS_ROOT, ...segments);
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const st = await stat(filePath);
    if (!st.isFile()) return new NextResponse(null, { status: 404 });
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
