import type { EmailSettings, UserWriting } from "./store";

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
