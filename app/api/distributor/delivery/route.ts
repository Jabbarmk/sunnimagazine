import { NextResponse } from "next/server";
import db from "@/lib/db";
import { requireDistributor } from "@/lib/distributorAuth";
import { mapSub } from "@/lib/distributionDb";
import { distStatus } from "@/lib/distribution";

export const dynamic = "force-dynamic";

const YM = /^\d{4}-\d{2}$/;

// GET /api/distributor/delivery?month=YYYY-MM
// Returns the existing report for that month (if any) + the full active subscriber list
// so the portal can pre-fill the form.
export async function GET(req: Request) {
  const auth = await requireDistributor(req);
  if ("error" in auth) return auth.error;
  const { row } = auth;

  const params = new URL(req.url).searchParams;
  const month = params.get("month") || "";
  if (!YM.test(month)) return NextResponse.json({ error: "month required (YYYY-MM)" }, { status: 400 });

  const now = new Date();
  const [sRows] = await db.query(
    "SELECT * FROM distribution_subscribers WHERE distributor_code=? ORDER BY sub_code ASC",
    [row.code]
  );
  const activeSubs = (sRows as any[]).map(mapSub).filter((s) => distStatus(s.expiryMonth, now) !== "removed");

  const [rRows] = await db.query(
    "SELECT * FROM distribution_delivery_reports WHERE distributor_code=? AND month=?",
    [row.code, month]
  );
  const report = (rRows as any[])[0] ?? null;

  let items: any[] = [];
  if (report) {
    const [iRows] = await db.query(
      "SELECT * FROM distribution_delivery_items WHERE report_id=?",
      [report.id]
    );
    items = iRows as any[];
  }

  const itemsBySubId = new Map(items.map((i) => [i.sub_id, i]));

  return NextResponse.json({
    month,
    submitted: !!report,
    submittedAt: report?.submitted_at ? new Date(report.submitted_at).toISOString() : null,
    note: report?.note ?? "",
    subscribers: activeSubs.map((s) => {
      const item = itemsBySubId.get(s.id);
      return {
        id: s.id,
        subCode: s.subCode,
        name: s.name,
        phone: s.phone,
        address: s.address,
        delivered: item ? !!item.delivered : true,
        issue: item?.issue ?? "",
      };
    }),
  });
}

// POST /api/distributor/delivery
// Body: { month, note, items: [{ subId, delivered, issue }] }
// Creates or replaces the report for that month.
export async function POST(req: Request) {
  const auth = await requireDistributor(req);
  if ("error" in auth) return auth.error;
  const { row } = auth;

  const b = await req.json().catch(() => ({}));
  const month = String(b.month || "");
  if (!YM.test(month)) return NextResponse.json({ error: "month required (YYYY-MM)" }, { status: 400 });
  if (!Array.isArray(b.items)) return NextResponse.json({ error: "items required" }, { status: 400 });

  // Verify all subIds belong to this distributor
  const subIds: number[] = b.items.map((i: any) => Number(i.subId)).filter((n: number) => Number.isFinite(n));
  if (subIds.length > 0) {
    const [ownerCheck] = await db.query(
      `SELECT id FROM distribution_subscribers WHERE id IN (${subIds.map(() => "?").join(",")}) AND distributor_code != ?`,
      [...subIds, row.code]
    );
    if ((ownerCheck as any[]).length > 0) {
      return NextResponse.json({ error: "One or more subscribers are not on your list" }, { status: 403 });
    }
  }

  const note = String(b.note || "").trim().slice(0, 1000) || null;
  const conn = db;

  // Upsert the report
  await conn.query(
    `INSERT INTO distribution_delivery_reports (distributor_code, month, note, submitted_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE note=VALUES(note), submitted_at=NOW()`,
    [row.code, month, note]
  );

  const [rRows] = await conn.query(
    "SELECT id FROM distribution_delivery_reports WHERE distributor_code=? AND month=?",
    [row.code, month]
  );
  const reportId = (rRows as any[])[0].id;

  // Replace all items for this report
  await conn.query("DELETE FROM distribution_delivery_items WHERE report_id=?", [reportId]);

  if (b.items.length > 0) {
    const vals = b.items.flatMap((i: any) => [
      reportId,
      Number(i.subId),
      i.delivered === false ? 0 : 1,
      String(i.issue || "").trim().slice(0, 500) || null,
    ]);
    const placeholders = b.items.map(() => "(?,?,?,?)").join(",");
    await conn.query(
      `INSERT INTO distribution_delivery_items (report_id, sub_id, delivered, issue) VALUES ${placeholders}`,
      vals
    );
  }

  return NextResponse.json({ ok: true, reportId });
}
