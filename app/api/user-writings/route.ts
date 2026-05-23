import { NextResponse } from "next/server";
import db from "@/lib/db";
import nodemailer from "nodemailer";

async function getEmailSettings() {
  const [rows] = await db.query("SELECT * FROM email_settings WHERE id=1");
  return (rows as any[])[0] || null;
}

async function sendWritingNotification(s: any, writing: any) {
  if (!s?.host || !s?.username || !s?.password) return;

  const transporter = nodemailer.createTransport({
    host: s.host,
    port: parseInt(s.port) || 587,
    secure: parseInt(s.port) === 465,
    auth: { user: s.username, pass: s.password },
  });

  const from = s.from_name ? `${s.from_name} <${s.username}>` : s.username;
  const errors: string[] = [];

  if (s.admin_email) {
    try {
      await transporter.sendMail({
        from,
        to: s.admin_email,
        subject: `New Writing Submission — ${writing.artCategoryName || "Gulf Sathyadhara"}`,
        html: `<div style="font-family:sans-serif;max-width:600px">
<h2 style="color:#b8860b">New Writing Submission</h2>
<table style="width:100%;border-collapse:collapse">
  <tr><td style="padding:8px;font-weight:bold;width:130px">Name</td><td style="padding:8px">${writing.name}</td></tr>
  <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${writing.email}</td></tr>
  <tr><td style="padding:8px;font-weight:bold">Category</td><td style="padding:8px">${writing.artCategoryName}</td></tr>
  <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;vertical-align:top">Writing</td><td style="padding:8px;white-space:pre-wrap">${writing.description}</td></tr>
</table>
</div>`,
      });
    } catch (e) { errors.push(String(e)); }
  }

  if (writing.email) {
    try {
      await transporter.sendMail({
        from,
        to: writing.email,
        subject: "We received your writing — Gulf Sathyadhara",
        html: `<p>Dear ${writing.name},</p>
<p>Thank you for your submission to <b>Gulf Sathyadhara</b>. We have received your writing in the <b>${writing.artCategoryName}</b> category.</p>
<p>We will review it and get back to you shortly.</p>
<br><p>— Gulf Sathyadhara Team</p>`,
      });
    } catch (e) { errors.push(String(e)); }
  }

  if (errors.length) console.error("Writing email errors:", errors.join("; "));
}

export async function GET() {
  const [rows] = await db.query("SELECT * FROM user_writings ORDER BY sent_at DESC");
  return NextResponse.json((rows as any[]).map((r) => ({
    ...r,
    artCategoryId: r.art_category_id,
    artCategoryName: r.art_category_name,
    sentAt: r.sent_at,
  })));
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO user_writings (id,name,email,art_category_id,art_category_name,description,image,sent_at,status)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [b.id, b.name, b.email, b.artCategoryId, b.artCategoryName, b.description, b.image || null, b.sentAt, b.status || "pending"]
  );

  try {
    const settings = await getEmailSettings();
    await sendWritingNotification(settings, b);
  } catch (e) {
    console.error("Email send error:", e);
  }

  return NextResponse.json({ ok: true });
}
