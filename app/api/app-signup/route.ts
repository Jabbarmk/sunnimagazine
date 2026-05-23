import { NextResponse } from "next/server";
import db from "@/lib/db";
import nodemailer from "nodemailer";

const DEFAULT_SIGNUP_TEMPLATE =
  "Your registration is successful. About Gulf Sathyadhara Subscription, our sales team will contact you soon.";

async function sendSignupEmails(name: string, email: string, mobile: string) {
  const [rows] = await db.query("SELECT * FROM email_settings WHERE id=1");
  const s = (rows as any[])[0];
  if (!s?.host || !s?.username || !s?.password) return;

  const transporter = nodemailer.createTransport({
    host: s.host,
    port: parseInt(s.port) || 587,
    secure: parseInt(s.port) === 465,
    auth: { user: s.username, pass: s.password },
  });

  const from = s.from_name ? `${s.from_name} <${s.username}>` : s.username;
  const templateBody = (s.signup_email_template || DEFAULT_SIGNUP_TEMPLATE)
    .replace(/\{name\}/g, name)
    .replace(/\{email\}/g, email)
    .replace(/\{mobile\}/g, mobile || "");

  const errors: string[] = [];

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Registration Successful — Gulf Sathyadhara",
      html: `<p>Dear ${name},</p><p>${templateBody.replace(/\n/g, "<br/>")}</p><br><p>— Gulf Sathyadhara Team</p>`,
    });
  } catch (e) { errors.push(String(e)); }

  if (s.admin_email) {
    try {
      await transporter.sendMail({
        from,
        to: s.admin_email,
        subject: `New Registration — ${name}`,
        html: `<h3>New User Registration</h3>
<p><b>Name:</b> ${name}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Mobile:</b> ${mobile || "—"}</p>`,
      });
    } catch (e) { errors.push(String(e)); }
  }

  if (errors.length) console.error("Signup email errors:", errors.join("; "));
}

export async function POST(req: Request) {
  const { name, email, mobile } = await req.json();
  if (!name?.trim() || !email?.trim())
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });

  const [dupEmail] = await db.query("SELECT id FROM app_users WHERE email=?", [email]);
  if ((dupEmail as any[]).length > 0)
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  if (mobile?.trim()) {
    const [dupMobile] = await db.query("SELECT id FROM app_users WHERE mobile=?", [mobile]);
    if ((dupMobile as any[]).length > 0)
      return NextResponse.json({ error: "Mobile number already registered" }, { status: 409 });
  }

  const id = "usr_" + Date.now();
  await db.query(
    `INSERT INTO app_users (id,name,email,mobile,password,is_active,location,photo)
     VALUES (?,?,?,?,?,1,'',NULL)`,
    [id, name.trim(), email.trim(), mobile?.trim() || null, null]
  );

  try {
    await sendSignupEmails(name.trim(), email.trim(), mobile?.trim() || "");
  } catch (e) {
    console.error("Signup email error:", e);
  }

  return NextResponse.json({ ok: true, id });
}
