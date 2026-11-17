import { NextResponse } from "next/server";
import db from "@/lib/db";
import { mapSub, ensureDeliveryTables } from "@/lib/distributionDb";
import { distStatus } from "@/lib/distribution";

export const dynamic = "force-dynamic";

const YM = /^\d{4}-\d{2}$/;

// GET /api/distribution/delivery?month=YYYY-MM
// Returns every distributor with their delivery report status for that month.
// When ?code=N is added, returns the full item list for that distributor's report.
export async function GET(req: Request) {
  await ensureDeliveryTables();
  const params = new URL(req.url).searchParams;
  const month = params.get("month") || "";
  if (!YM.test(month)) return NextResponse.json({ error: "month required (YYYY-MM)" }, { status: 400 });

  const codeParam = params.get("code");

  if (codeParam) {
    // Single distributor full report
    const code = Number(codeParam);
    if (!Number.isFinite(code)) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    const [dRows] = await db.query("SELECT * FROM distribution_distributors WHERE code=?", [code]);
    const dist = (dRows as any[])[0];
    if (!dist) return NextResponse.json({ error: "Distributor not found" }, { status: 404 });

    const [rRows] = await db.query(
      "SELECT * FROM distribution_delivery_reports WHERE distributor_code=? AND month=?",
      [code, month]
    );
    const report = (rRows as any[])[0] ?? null;

    const now = new Date();
    const [sRows] = await db.query(
      "SELECT * FROM distribution_subscribers WHERE distributor_code=? ORDER BY sub_code ASC",
      [code]
    );
    const activeSubs = (sRows as any[]).map(mapSub).filter((s) => distStatus(s.expiryMonth, now) !== "removed");

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
      distributor: { code: dist.code, name: dist.name, phone: dist.phone ?? "" },
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
          delivered: item ? !!item.delivered : null,
          issue: item?.issue ?? "",
        };
      }),
    });
  }

  // All distributors summary
  const [dRows] = await db.query("SELECT code, name, phone FROM distribution_distributors ORDER BY code ASC");
  const [rRows] = await db.query(
    "SELECT r.distributor_code, r.submitted_at, r.note, COUNT(i.id) as total, SUM(i.delivered) as delivered_count FROM distribution_delivery_reports r LEFT JOIN distribution_delivery_items i ON i.report_id=r.id WHERE r.month=? GROUP BY r.id",
    [month]
  );

  const reportByCode = new Map((rRows as any[]).map((r) => [r.distributor_code, r]));

  // Count active subscribers per distributor
  const now = new Date();
  const [sRows] = await db.query("SELECT distributor_code, expiry_month FROM distribution_subscribers");
  const activeByCode = new Map<number, number>();
  for (const s of sRows as any[]) {
    if (distStatus(s.expiry_month, now) !== "removed") {
      activeByCode.set(s.distributor_code, (activeByCode.get(s.distributor_code) ?? 0) + 1);
    }
  }

  return NextResponse.json({
    month,
    distributors: (dRows as any[]).map((d) => {
      const r = reportByCode.get(d.code);
      return {
        code: d.code,
        name: d.name,
        phone: d.phone ?? "",
        activeSubs: activeByCode.get(d.code) ?? 0,
        submitted: !!r,
        submittedAt: r?.submitted_at ? new Date(r.submitted_at).toISOString() : null,
        deliveredCount: r ? Number(r.delivered_count ?? 0) : null,
        totalReported: r ? Number(r.total ?? 0) : null,
        note: r?.note ?? "",
      };
    }),
  });
}
