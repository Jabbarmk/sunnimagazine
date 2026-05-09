import type { EmailSettings, UserWriting, UserSubscription } from "./store";

declare global {
  interface Window {
    Email?: {
      send: (params: Record<string, unknown>) => Promise<string>;
    };
  }
}

function loadSmtpJs(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Email) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://smtpjs.com/v3/smtp.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load smtp.js"));
    document.head.appendChild(script);
  });
}

async function send(settings: EmailSettings, to: string, subject: string, body: string): Promise<void> {
  await loadSmtpJs();
  const result = await window.Email!.send({
    Host: settings.host,
    Port: parseInt(settings.port) || 587,
    Username: settings.username,
    Password: settings.password,
    To: to,
    From: settings.fromName ? `${settings.fromName} <${settings.username}>` : settings.username,
    Subject: subject,
    Body: body,
  });
  if (result !== "OK") throw new Error(result);
}

export async function sendWritingEmails(settings: EmailSettings, writing: UserWriting): Promise<void> {
  if (!settings.host || !settings.username || !settings.password) return;

  const errors: string[] = [];

  if (settings.adminEmail) {
    try {
      await send(
        settings,
        settings.adminEmail,
        `New Writing Submission — ${writing.artCategoryName || "Gulf Sathyadhara"}`,
        `<h2>New Submission</h2>
<p><b>Name:</b> ${writing.name}</p>
<p><b>Email:</b> ${writing.email}</p>
<p><b>Category:</b> ${writing.artCategoryName}</p>
<p><b>Writing:</b></p>
<p style="white-space:pre-wrap">${writing.description}</p>`
      );
    } catch (e) { errors.push(String(e)); }
  }

  try {
    await send(
      settings,
      writing.email,
      "We received your writing — Gulf Sathyadhara",
      `<p>Dear ${writing.name},</p>
<p>Thank you for your submission to <b>Gulf Sathyadhara</b>. We have received your writing in the <b>${writing.artCategoryName}</b> category.</p>
<p>We will review it and get back to you shortly.</p>
<br><p>— Gulf Sathyadhara Team</p>`
    );
  } catch (e) { errors.push(String(e)); }

  if (errors.length) throw new Error(errors.join("; "));
}

function fmtMonth(val: string): string {
  if (!val) return "";
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [y, m] = val.split("-");
  const idx = parseInt(m) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${y}` : val;
}

export async function sendSubscriptionReceipt(
  settings: EmailSettings,
  userName: string,
  userEmail: string,
  sub: UserSubscription
): Promise<void> {
  if (!settings.host || !settings.username || !settings.password || !userEmail) return;

  const receiptHtml = `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e0d6c0;border-radius:10px;overflow:hidden;">
  <div style="background:#16161C;padding:24px;text-align:center;">
    <h2 style="color:#B08A3A;margin:0;font-size:20px;">Gulf Sathyadhara</h2>
    <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">Subscription Receipt</p>
  </div>
  <div style="padding:24px;background:#fff;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;font-size:13px;">Member</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${userName}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Subscription Period</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:13px;">${fmtMonth(sub.fromMonth)} – ${fmtMonth(sub.toMonth)}</td></tr>
      <tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Amount Paid</td><td style="padding:8px 0;text-align:right;font-weight:700;font-size:15px;color:#B08A3A;">AED ${sub.amountAed}</td></tr>
      ${sub.paidDate ? `<tr style="border-top:1px solid #f0f0f0;"><td style="padding:8px 0;color:#666;font-size:13px;">Payment Date</td><td style="padding:8px 0;text-align:right;font-size:13px;">${sub.paidDate}</td></tr>` : ""}
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center;">Thank you for supporting Gulf Sathyadhara.</p>
  </div>
</div>`;

  const errors: string[] = [];

  try {
    await send(settings, userEmail, "Subscription Receipt — Gulf Sathyadhara", receiptHtml);
  } catch (e) { errors.push(String(e)); }

  if (settings.adminEmail) {
    try {
      await send(
        settings,
        settings.adminEmail,
        `Subscription Added — ${userName}`,
        `<p><b>${userName}</b> (${userEmail}) subscription added.</p>
         <p>Period: ${fmtMonth(sub.fromMonth)} – ${fmtMonth(sub.toMonth)}</p>
         <p>Amount: AED ${sub.amountAed}</p>
         ${sub.paidDate ? `<p>Paid: ${sub.paidDate}</p>` : ""}`
      );
    } catch (e) { errors.push(String(e)); }
  }

  if (errors.length) throw new Error(errors.join("; "));
}
