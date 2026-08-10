import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// Cells come back as a string ("01/01/2026"), a Date (if Excel auto-detected
// the cell as a date type despite the template forcing text format), rich
// text, or a formula result — normalize all of those to a plain string.
function cellStr(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("text" in v) return String((v as any).text);
    if ("result" in v) return String((v as any).result ?? "");
  }
  return String(v).trim();
}

// Accepts "DD/MM/YYYY" text or a Date object (if Excel reinterpreted the
// cell) -> "YYYY-MM-DD" for storage. Returns null if unparseable/blank.
function parseDate(v: ExcelJS.CellValue): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    const y = v.getUTCFullYear(), mo = String(v.getUTCMonth() + 1).padStart(2, "0"), d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }
  const s = cellStr(v);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const defaultPassword = String(form.get("defaultPassword") || "").trim();

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!defaultPassword) return NextResponse.json({ error: "Default password is required" }, { status: 400 });

  const wb = new ExcelJS.Workbook();
  try {
    // exceljs's bundled Buffer type is structurally incompatible with this
    // project's @types/node version — the runtime value is a plain Buffer,
    // only the type declaration mismatch is stale.
    await wb.xlsx.load(Buffer.from(await file.arrayBuffer()) as any);
  } catch {
    return NextResponse.json({ error: "Could not read file — please upload a valid .xlsx file" }, { status: 400 });
  }

  const ws = wb.worksheets[0];
  if (!ws) return NextResponse.json({ error: "No sheet found in file" }, { status: 400 });

  const headers: string[] = [];
  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cellStr(cell.value).toLowerCase();
  });
  const col = (name: string) => headers.findIndex((h) => h === name);
  const idx = {
    name: col("name"), email: col("email"), mobile: col("mobile"), whatsapp: col("whatsapp"),
    code: col("code"), emirates: col("emirate"), location: col("location"),
    subFrom: col("subscription from"), subTo: col("subscription to"),
    amount: col("amount paid (aed)"), paidDate: col("paid date"),
    referredBy: col("referred by"), referralMobile: col("referral mobile"),
  };
  if (idx.name < 0 || idx.email < 0) {
    return NextResponse.json(
      { error: "Name and Email columns not found — please use the downloaded template and don't rename the header row." },
      { status: 400 }
    );
  }

  const [existingRows] = await db.query("SELECT email FROM app_users");
  const existingEmails = new Set((existingRows as any[]).map((r) => String(r.email).toLowerCase()));

  const created: string[] = [];
  const skipped: { row: number; email: string; reason: string }[] = [];

  const dataRows: ExcelJS.Row[] = [];
  ws.eachRow((row, rowNumber) => { if (rowNumber > 1) dataRows.push(row); });

  for (const row of dataRows) {
    const get = (i: number) => (i > 0 ? cellStr(row.getCell(i).value) : "");
    const name = get(idx.name);
    const email = get(idx.email);
    if (!name && !email) continue; // blank row

    if (!name || !email) {
      skipped.push({ row: row.number, email, reason: "Missing name or email" });
      continue;
    }
    if (existingEmails.has(email.toLowerCase())) {
      skipped.push({ row: row.number, email, reason: "Email already exists" });
      continue;
    }

    const mobile = get(idx.mobile);
    let whatsapp = get(idx.whatsapp);
    if (!whatsapp && /^0\d{9}$/.test(mobile)) whatsapp = "971" + mobile.slice(1);

    const subFrom = idx.subFrom > 0 ? parseDate(row.getCell(idx.subFrom).value) : null;
    const subTo = idx.subTo > 0 ? parseDate(row.getCell(idx.subTo).value) : null;
    const hasSubscription = !!(subFrom && subTo);
    const paidDate = idx.paidDate > 0 ? parseDate(row.getCell(idx.paidDate).value) : null;
    const amountRaw = idx.amount > 0 ? row.getCell(idx.amount).value : null;
    const amount = amountRaw != null && amountRaw !== "" ? Number(amountRaw) || 0 : 0;

    const id = "usr_" + Date.now() + "_" + row.number;
    await db.query(
      `INSERT INTO app_users (id,name,email,password,mobile,whatsapp,code,location,emirates,subscription_from,subscription_to,is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`,
      [
        id, name, email, defaultPassword,
        mobile || null, whatsapp || null, get(idx.code) || null, get(idx.location) || null, get(idx.emirates),
        hasSubscription ? subFrom : null, hasSubscription ? subTo : null,
      ]
    );

    if (hasSubscription) {
      const subId = "sub_" + Date.now() + "_" + row.number;
      await db.query(
        "INSERT INTO user_subscriptions (id,user_id,amount_aed,from_month,to_month,paid_date) VALUES (?,?,?,?,?,?)",
        [subId, id, amount, subFrom, subTo, paidDate]
      );
    }

    // referredBy/referralMobile only if present — separate update to keep
    // the INSERT above focused on the columns every row always has.
    const referredBy = get(idx.referredBy);
    const referralMobile = get(idx.referralMobile);
    if (referredBy || referralMobile) {
      await db.query(
        "UPDATE app_users SET referred_by=?, referral_mobile=? WHERE id=?",
        [referredBy || null, referralMobile || null, id]
      );
    }

    existingEmails.add(email.toLowerCase());
    created.push(email);
  }

  return NextResponse.json({ ok: true, createdCount: created.length, created, skipped });
}
