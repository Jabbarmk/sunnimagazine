import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import db from "@/lib/db";
import { fmtDate } from "@/lib/subscription";
import { generatePassword } from "@/lib/password";

export const dynamic = "force-dynamic";

function receiptHtml(userName: string, amountAed: number, fromMonth: string, toMonth: string, paidDate: string | null) {
  return `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0d6c0;border-radius:10px;overflow:hidden;">
  <div style="background:#16161C;padding:24px;text-align:center;">
    <h2 style="color:#B08A3A;margin:0;font-size:20px;">Gulf Sathyadhara</h2>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Subscription Receipt</p>
  </div>
  <div style="padding:24px;background:#fff;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;font-size:13px;">Member</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${userName}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Subscription Period</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${fmtDate(fromMonth)} – ${fmtDate(toMonth)}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Amount Paid</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:15px;color:#B08A3A;">AED ${amountAed}</td></tr>
      ${paidDate ? `<tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Payment Date</td><td style="padding:8px 0;text-align:right;font-size:13px;">${paidDate}</td></tr>` : ""}
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center;">Thank you for supporting Gulf Sathyadhara.</p>
  </div>
</div>`;
}

function credentialsHtml(userName: string, identifier: string, generatedPassword: string | null) {
  const passwordRow = generatedPassword
    ? `<tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Password</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:14px;color:#B08A3A;letter-spacing:1px;">${generatedPassword}</td></tr>`
    : "";
  return `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0d6c0;border-radius:10px;overflow:hidden;">
  <div style="background:#16161C;padding:24px;text-align:center;">
    <h2 style="color:#B08A3A;margin:0;font-size:20px;">Gulf Sathyadhara</h2>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Your account is ready</p>
  </div>
  <div style="padding:24px;background:#fff;">
    <p style="font-size:13px;color:#333;">Dear ${userName},</p>
    <p style="font-size:13px;color:#333;">Your Gulf Sathyadhara subscription has been activated. You can now sign in to the app:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;font-size:13px;">Login (mobile / email)</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${identifier}</td></tr>
      ${passwordRow}
    </table>
    ${generatedPassword
      ? `<p style="margin:16px 0 0;font-size:12px;color:#999;">You can change this password anytime from the app's profile screen.</p>`
      : `<p style="margin:16px 0 0;font-size:12px;color:#999;">Sign in with your existing password. If you've forgotten it, please contact our team.</p>`}
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center;">— Gulf Sathyadhara Team</p>
  </div>
</div>`;
}

// Sends the receipt and account-ready emails via SMTP directly (like the
// signup route) — the browser-side smtp.js relay used elsewhere is
// unreliable, and approval mail must not depend on it.
async function sendApprovalEmails(
  user: { name: string; email: string; mobile: string },
  sub: { amountAed: number; fromMonth: string; toMonth: string; paidDate: string | null },
  generatedPassword: string | null
): Promise<{ receiptSent: boolean; credentialsSent: boolean; error: string | null }> {
  const none = { receiptSent: false, credentialsSent: false, error: null as string | null };
  if (!user.email) return { ...none, error: "user has no email" };

  const [rows] = await db.query("SELECT * FROM email_settings WHERE id=1");
  const s = (rows as any[])[0];
  if (!s?.host || !s?.username || !s?.password) return { ...none, error: "SMTP not configured" };

  const transporter = nodemailer.createTransport({
    host: s.host,
    port: parseInt(s.port) || 587,
    secure: parseInt(s.port) === 465,
    auth: { user: s.username, pass: s.password },
  });
  const from = s.from_name ? `${s.from_name} <${s.username}>` : s.username;

  const result = { receiptSent: false, credentialsSent: false, error: null as string | null };
  const errors: string[] = [];

  try {
    await transporter.sendMail({
      from,
      to: user.email,
      subject: "Subscription Receipt — Gulf Sathyadhara",
      html: receiptHtml(user.name, sub.amountAed, sub.fromMonth, sub.toMonth, sub.paidDate),
    });
    result.receiptSent = true;
  } catch (e) { errors.push("receipt: " + String(e)); }

  try {
    await transporter.sendMail({
      from,
      to: user.email,
      subject: "Your Account is Ready — Gulf Sathyadhara",
      html: credentialsHtml(user.name, user.mobile || user.email, generatedPassword),
    });
    result.credentialsSent = true;
  } catch (e) { errors.push("credentials: " + String(e)); }

  if (s.admin_email) {
    try {
      await transporter.sendMail({
        from,
        to: s.admin_email,
        subject: `Subscription Added — ${user.name}`,
        html: `<p><b>${user.name}</b> (${user.email}) approved &amp; subscription added.</p>
<p>Period: ${fmtDate(sub.fromMonth)} – ${fmtDate(sub.toMonth)}</p>
<p>Amount: AED ${sub.amountAed}</p>
${sub.paidDate ? `<p>Paid: ${sub.paidDate}</p>` : ""}`,
      });
    } catch (e) { errors.push("admin: " + String(e)); }
  }

  if (errors.length) result.error = errors.join("; ");
  return result;
}

// Approve a new registration: record their first subscription and, if they
// have no password yet (app signups store NULL), generate one so they can
// log in. The plaintext is returned once so the dashboard can show it.
export async function POST(req: Request) {
  const { userId, amountAed, fromMonth, toMonth, paidDate } = await req.json();
  if (!userId || amountAed === undefined || amountAed === null || amountAed === "" || !fromMonth || !toMonth) {
    return NextResponse.json({ error: "userId, amountAed, fromMonth and toMonth are required" }, { status: 400 });
  }

  const [rows] = await db.query(
    "SELECT id, name, email, mobile, password FROM app_users WHERE id=? AND deleted_at IS NULL",
    [userId]
  );
  const user = (rows as any[])[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const subscriptionId = "sub_" + Date.now();
  await db.query(
    "INSERT INTO user_subscriptions (id,user_id,amount_aed,from_month,to_month,paid_date) VALUES (?,?,?,?,?,?)",
    [subscriptionId, userId, amountAed, fromMonth, toMonth, paidDate || null]
  );

  // Resync the cached fields to whichever entry is actually latest, matching
  // the behavior of the regular subscription-save endpoint.
  const [latestRows] = await db.query(
    "SELECT from_month, to_month FROM user_subscriptions WHERE user_id=? ORDER BY paid_date DESC, created_at DESC LIMIT 1",
    [userId]
  );
  const latest = (latestRows as any[])[0];
  await db.query(
    "UPDATE app_users SET subscription_from=?, subscription_to=? WHERE id=?",
    [latest?.from_month ?? null, latest?.to_month ?? null, userId]
  );

  let generatedPassword: string | null = null;
  if (!user.password || String(user.password).length === 0) {
    generatedPassword = generatePassword();
    const hash = await bcrypt.hash(generatedPassword, 10);
    await db.query("UPDATE app_users SET password=? WHERE id=?", [hash, userId]);
  }

  let emails: { receiptSent: boolean; credentialsSent: boolean; error: string | null };
  try {
    emails = await sendApprovalEmails(
      { name: user.name, email: user.email ?? "", mobile: user.mobile ?? "" },
      { amountAed: Number(amountAed), fromMonth, toMonth, paidDate: paidDate || null },
      generatedPassword
    );
  } catch (e) {
    emails = { receiptSent: false, credentialsSent: false, error: String(e) };
  }

  return NextResponse.json({
    ok: true,
    subscriptionId,
    generatedPassword,
    emails,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile ?? "" },
  });
}
