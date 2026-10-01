import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { subStatus, daysLeft, fmtDate } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type ExportUser = {
  id: string; name: string; email: string; mobile: string; whatsapp: string;
  code: string; emirates: string; location: string;
  subscriptionFrom: string; subscriptionTo: string;
  referredBy: string; referralMobile: string; photo: string; isActive: boolean;
};

const STATUS_LABEL = { active: "Active", expiring: "Expiring Soon", expired: "Expired", none: "No Sub" } as const;
const STATUS_FILL = { active: "FFE6F4EA", expiring: "FFFFF4D6", expired: "FFFDE7E7", none: "FFF1F1F1" } as const;

export async function POST(req: Request) {
  const { users } = (await req.json()) as { users: ExportUser[] };
  if (!Array.isArray(users)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Users", { views: [{ state: "frozen", ySplit: 1, xSplit: 2 }] });

  ws.columns = [
    { header: "#", key: "no", width: 6 },
    { header: "Name", key: "name", width: 26 },
    { header: "Email", key: "email", width: 32 },
    { header: "Mobile", key: "mobile", width: 16 },
    { header: "WhatsApp", key: "whatsapp", width: 16 },
    { header: "Code", key: "code", width: 14 },
    { header: "Emirate", key: "emirates", width: 16 },
    { header: "Location", key: "location", width: 24 },
    { header: "Subscription From", key: "from", width: 19 },
    { header: "Subscription To", key: "to", width: 19 },
    { header: "Days Left", key: "days", width: 11 },
    { header: "Subscription Status", key: "status", width: 20 },
    { header: "Account", key: "account", width: 11 },
    { header: "Referred By", key: "referredBy", width: 22 },
    { header: "Referral Mobile", key: "referralMobile", width: 17 },
    { header: "Photo", key: "photo", width: 10 },
    { header: "User ID", key: "id", width: 22 },
  ];

  // Phone-like and date columns as text so Excel keeps leading zeros and formats.
  ["D", "E", "F", "I", "J", "O"].forEach((c) => { ws.getColumn(c).numFmt = "@"; });

  users.forEach((u, i) => {
    const st = subStatus(u.subscriptionTo);
    const row = ws.addRow({
      no: i + 1,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      whatsapp: u.whatsapp,
      code: u.code,
      emirates: u.emirates,
      location: u.location,
      from: fmtDate(u.subscriptionFrom),
      to: fmtDate(u.subscriptionTo),
      days: u.subscriptionTo ? daysLeft(u.subscriptionTo) : "",
      status: STATUS_LABEL[st],
      account: u.isActive ? "Active" : "Inactive",
      referredBy: u.referredBy,
      referralMobile: u.referralMobile,
      photo: u.photo ? "Yes" : "No",
      id: u.id,
    });
    row.getCell("status").fill = { type: "pattern", pattern: "solid", fgColor: { argb: STATUS_FILL[st] } };
  });

  const header = ws.getRow(1);
  header.height = 28;
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };

  const thin = { style: "thin" as const, color: { argb: "FFD9D9D9" } };
  const centered = new Set(["no", "days", "status", "account", "photo", "from", "to"]);
  ws.eachRow((row, n) => {
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      const key = ws.getColumn(col).key as string;
      cell.border = { top: thin, left: thin, bottom: thin, right: thin };
      cell.alignment = {
        vertical: "middle",
        horizontal: n === 1 || centered.has(key) ? "center" : "left",
        wrapText: false,
        indent: n > 1 && !centered.has(key) ? 1 : 0,
      };
    });
    if (n > 1) row.height = 22;
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };

  const buffer = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="users_${stamp}.xlsx"`,
    },
  });
}
