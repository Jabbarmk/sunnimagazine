import { NextResponse } from "next/server";
import db from "@/lib/db";
import nodemailer from "nodemailer";

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

  // Send email notification using SMTP settings from DB
  try {
    const [settingsRows] = await db.query("SELECT * FROM email_settings WHERE id=1");
    const s = (settingsRows as any[])[0];
    if (s && s.host && s.username && s.admin_email) {
      const transporter = nodemailer.createTransport({
        host: s.host,
        port: Number(s.port) || 465,
        secure: Number(s.port) === 465,
        auth: { user: s.username, pass: s.password },
      });

      await transporter.sendMail({
        from: `"${s.from_name}" <${s.username}>`,
        to: s.admin_email,
        subject: `New Writing Submission – ${b.artCategoryName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px">
            <h2 style="color:#b8860b">New Writing Submission</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;font-weight:bold;width:130px">Name</td><td style="padding:8px">${b.name}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${b.email}</td></tr>
              <tr><td style="padding:8px;font-weight:bold">Category</td><td style="padding:8px">${b.artCategoryName}</td></tr>
              <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;vertical-align:top">Writing</td><td style="padding:8px;white-space:pre-wrap">${b.description}</td></tr>
            </table>
          </div>
        `,
      });
    }
  } catch (err) {
    // Email failure should not block the submission response
    console.error("[user-writings] email error:", err);
  }

  return NextResponse.json({ ok: true });
}
