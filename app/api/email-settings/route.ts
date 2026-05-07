import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM email_settings WHERE id=1");
  const r = (rows as any[])[0];
  if (!r) return NextResponse.json({ host:"",port:"587",username:"",password:"",fromName:"",adminEmail:"" });
  return NextResponse.json({
    host: r.host, port: r.port, username: r.username,
    password: r.password, fromName: r.from_name, adminEmail: r.admin_email,
  });
}

export async function POST(req: Request) {
  const b = await req.json();
  await db.query(
    `INSERT INTO email_settings (id,host,port,username,password,from_name,admin_email) VALUES (1,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE host=VALUES(host),port=VALUES(port),username=VALUES(username),
       password=VALUES(password),from_name=VALUES(from_name),admin_email=VALUES(admin_email)`,
    [b.host, b.port, b.username, b.password, b.fromName, b.adminEmail]
  );
  return NextResponse.json({ ok: true });
}
