import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import db from "@/lib/db";
import { distStatus, distStatusText, fmtMonth, monthsLeft, type DistStatus } from "@/lib/distribution";

export const dynamic = "force-dynamic";

const FILL: Record<DistStatus, string> = {
  safe: "FFFFFFFF", near: "FFFFF4D6", grace: "FFFDE7E7", overdue: "FFF8CFCF", removed: "FFE5E5E5",
};

// GET /api/distribution/export?distributor=<code>&status=<safe|near|grace|overdue|removed|active>&q=<text>
// One sheet laid out like the Distributor-wise List report (distributor details first, then rows).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const distributor = sp.get("distributor");
  const status = sp.get("status") || "";
  const q = (sp.get("q") || "").trim().toLowerCase();

  const [dRows] = await db.query("SELECT * FROM distribution_distributors ORDER BY code ASC");
  const [sRows] = await db.query("SELECT * FROM distribution_subscribers ORDER BY distributor_code ASC, sub_code ASC");
  const dists = (dRows as any[]).filter((d) => !distributor || String(d.code) === distributor);
  const now = new Date();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Distribution", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "Distributor No", key: "dcode", width: 15 },
    { header: "Distributor", key: "dname", width: 30 },
    { header: "Distributor Phone", key: "dphone", width: 18 },
    { header: "Area", key: "area", width: 20 },
    { header: "No", key: "no", width: 6 },
    { header: "Code", key: "code", width: 9 },
    { header: "Subscriber Name", key: "name", width: 32 },
    { header: "Phone", key: "phone", width: 22 },
    { header: "Delivery Address", key: "address", width: 52 },
    { header: "Start", key: "start", width: 10 },
    { header: "Years", key: "years", width: 8 },
    { header: "Expiry", key: "expiry", width: 10 },
    { header: "Months Left", key: "left", width: 13 },
    { header: "Status", key: "status", width: 38 },
  ];
  ["C", "H"].forEach((c) => { ws.getColumn(c).numFmt = "@"; });

  const rowStatus: DistStatus[] = [];
  for (const d of dists) {
    const subs = (sRows as any[]).filter((s) => s.distributor_code === d.code);
    let no = 0;
    for (const s of subs) {
      no++;
      const st = distStatus(s.expiry_month, now);
      if (status === "active" ? st === "removed" : status && st !== status) continue;
      if (q && ![s.name, s.phone, s.address, String(s.sub_code)].some((v) => (v || "").toLowerCase().includes(q))) continue;
      ws.addRow({
        dcode: d.code, dname: d.name, dphone: d.phone || "", area: d.area || "",
        no, code: s.sub_code, name: s.name, phone: s.phone || "", address: s.address || "",
        start: fmtMonth(s.start_month || ""), years: s.years ?? "", expiry: fmtMonth(s.expiry_month || ""),
        left: monthsLeft(s.expiry_month, now) ?? "", status: distStatusText(s.expiry_month, now),
      });
      rowStatus.push(st);
    }
  }

  const header = ws.getRow(1);
  header.height = 28;
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };

  const thin = { style: "thin" as const, color: { argb: "FFD9D9D9" } };
  const centered = new Set(["dcode", "no", "code", "start", "years", "expiry", "left"]);
  ws.eachRow((row, n) => {
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const key = ws.getColumn(col).key as string;
      cell.border = { top: thin, left: thin, bottom: thin, right: thin };
      cell.alignment = {
        vertical: "middle",
        horizontal: n === 1 || centered.has(key) ? "center" : "left",
        indent: n > 1 && !centered.has(key) ? 1 : 0,
      };
      if (n > 1 && rowStatus[n - 2] !== "safe") {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL[rowStatus[n - 2]] } };
      }
    });
    if (n > 1) row.height = 22;
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = now.toISOString().slice(0, 10);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="distribution_${stamp}.xlsx"`,
    },
  });
}
