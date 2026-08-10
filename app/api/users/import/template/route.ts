import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Users");

  ws.columns = [
    { header: "Name", key: "name", width: 22 },
    { header: "Email", key: "email", width: 26 },
    { header: "Mobile", key: "mobile", width: 16 },
    { header: "WhatsApp", key: "whatsapp", width: 16 },
    { header: "Code", key: "code", width: 14 },
    { header: "Emirate", key: "emirates", width: 14 },
    { header: "Location", key: "location", width: 20 },
    { header: "Subscription From", key: "subscriptionFrom", width: 18 },
    { header: "Subscription To", key: "subscriptionTo", width: 18 },
    { header: "Amount Paid (AED)", key: "amountAed", width: 18 },
    { header: "Paid Date", key: "paidDate", width: 14 },
    { header: "Referred By", key: "referredBy", width: 18 },
    { header: "Referral Mobile", key: "referralMobile", width: 18 },
  ];

  ws.addRow({
    name: "Ahmed Khan",
    email: "ahmed@example.com",
    mobile: "0501234567",
    whatsapp: "971501234567",
    code: "",
    emirates: "Dubai",
    location: "Dubai, UAE",
    subscriptionFrom: "01/01/2026",
    subscriptionTo: "31/12/2026",
    amountAed: 100,
    paidDate: "01/01/2026",
    referredBy: "",
    referralMobile: "",
  });

  // Force text formatting on date-shaped columns (Subscription From/To, Paid
  // Date) so Excel doesn't silently reinterpret "01/01/2026" as a
  // locale-dependent date type on save.
  ["H", "I", "K"].forEach((col) => {
    ws.getColumn(col).numFmt = "@";
  });

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="user_import_template.xlsx"',
    },
  });
}
