import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(
    "SELECT * FROM other_magazines ORDER BY sort_order ASC, created_at DESC"
  );
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id,
    title: r.title,
    details: r.details,
    cover: r.cover,
    pdfUrl: r.pdf_url,
    issueDate: r.issue_date,
    sortOrder: r.sort_order,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO other_magazines (id,title,details,cover,pdf_url,issue_date,sort_order)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title),details=VALUES(details),cover=VALUES(cover),
       pdf_url=VALUES(pdf_url),issue_date=VALUES(issue_date),sort_order=VALUES(sort_order)`,
    [b.id, b.title, b.details || null, b.cover || null, b.pdfUrl || null, b.issueDate || null, b.sortOrder ?? 0]
  );
  return NextResponse.json({ ok: true });
}
