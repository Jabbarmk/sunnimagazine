import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import db from "@/lib/db";
import { fmtDate, subStatus } from "@/lib/subscription";
import { generatePassword, isBcryptHash } from "@/lib/password";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
  none: "No subscription",
};

// Emails a user their account details (login + password) and current
// subscription. If the stored password is still readable it's sent as-is;
// a hashed one can't be recovered, so it's reset to a fresh generated
// password which is emailed instead.
export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const [rows] = await db.query(
    "SELECT id, name, email, mobile, password, subscription_from, subscription_to FROM app_users WHERE id=? AND deleted_at IS NULL",
    [userId]
  );
  const user = (rows as any[])[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.email) return NextResponse.json({ error: "User has no email address" }, { status: 400 });

  const [settingsRows] = await db.query("SELECT * FROM email_settings WHERE id=1");
  const s = (settingsRows as any[])[0];
  if (!s?.host || !s?.username || !s?.password) {
    return NextResponse.json({ error: "SMTP is not configured in Settings" }, { status: 400 });
  }

  const stored = String(user.password || "");
  let password: string;
  let passwordReset = false;
  if (stored && !isBcryptHash(stored)) {
    password = stored;
  } else {
    password = generatePassword();
    const hash = await bcrypt.hash(password, 10);
    await db.query("UPDATE app_users SET password=? WHERE id=?", [hash, userId]);
    passwordReset = true;
  }

  const [subRows] = await db.query(
    "SELECT amount_aed, from_month, to_month, paid_date FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC LIMIT 1",
    [userId]
  );
  const sub = (subRows as any[])[0];
  const fromMonth = sub?.from_month ?? user.subscription_from ?? "";
  const toMonth = sub?.to_month ?? user.subscription_to ?? "";
  const statusLabel = STATUS_LABEL[subStatus(toMonth)];

  const subRowsHtml = toMonth
    ? `
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Subscription Period</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${fmtDate(fromMonth)} – ${fmtDate(toMonth)}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Status</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${statusLabel}</td></tr>
      ${sub?.amount_aed != null ? `<tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Amount Paid</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:14px;color:#B08A3A;">AED ${sub.amount_aed}</td></tr>` : ""}
      ${sub?.paid_date ? `<tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Payment Date</td><td style="padding:8px 0;text-align:right;font-size:13px;">${sub.paid_date}</td></tr>` : ""}`
    : `<tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Subscription</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">No subscription on record</td></tr>`;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0d6c0;border-radius:10px;overflow:hidden;">
  <div style="background:#16161C;padding:24px;text-align:center;">
    <h2 style="color:#B08A3A;margin:0;font-size:20px;">Gulf Sathyadhara</h2>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Your Account Details</p>
  </div>
  <div style="padding:24px;background:#fff;">
    <p style="font-size:13px;color:#333;">Dear ${user.name},</p>
    <p style="font-size:13px;color:#333;">Here are your Gulf Sathyadhara account and subscription details:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;font-size:13px;">Name</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${user.name}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Login (mobile / email)</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${user.mobile || user.email}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Password</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:14px;color:#B08A3A;letter-spacing:1px;">${password}</td></tr>
      ${subRowsHtml}
    </table>
    ${passwordReset
      ? `<p style="margin:16px 0 0;font-size:12px;color:#999;">Your password has been reset to the one above. You can change it anytime from the app's profile screen.</p>`
      : `<p style="margin:16px 0 0;font-size:12px;color:#999;">You can change your password anytime from the app's profile screen.</p>`}
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center;">— Gulf Sathyadhara Team</p>
  </div>
</div>`;

  const transporter = nodemailer.createTransport({
    host: s.host,
    port: parseInt(s.port) || 587,
    secure: parseInt(s.port) === 465,
    auth: { user: s.username, pass: s.password },
  });
  const from = s.from_name ? `${s.from_name} <${s.username}>` : s.username;

  try {
    await transporter.sendMail({
      from,
      to: user.email,
      subject: "Your Account Details — Gulf Sathyadhara",
      html,
    });
  } catch (e) {
    // Password reset (if any) already happened — surface that so the admin
    // knows the old password no longer works even though the email failed.
    return NextResponse.json(
      { error: `Email failed to send${passwordReset ? " (note: the password was already reset)" : ""}: ${String(e)}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, passwordReset, sentTo: user.email });
}
