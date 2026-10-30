import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { mapSub } from "@/lib/distributionDb";
import { distStatus, distStatusText, monthsLeft, summarize, type DistSubscriber } from "@/lib/distribution";

export const dynamic = "force-dynamic";

const mapDist = (r: any) => ({
  code: r.code,
  name: r.name,
  phone: r.phone ?? "",
  state: r.state ?? "",
  area: r.area ?? "",
  username: r.username ?? "",
  isActive: r.is_active == null ? true : !!r.is_active,
  hasPassword: !!r.password,
});

// GET /api/distribution/distributors
//   -> every distributor with its summary counts (safe/near/grace/overdue/removed/total/active).
// GET /api/distribution/distributors?code=12[&status=near][&q=text]
//   -> one distributor, its summary, and its subscribers (each with status, statusText, monthsLeft).
//      status: active (default) | all | safe | near | grace | overdue | removed
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const now = new Date();
  const codeParam = params.get("code");

  if (codeParam === null) {
    const [dRows] = await db.query("SELECT * FROM distribution_distributors ORDER BY code ASC");
    const [sRows] = await db.query("SELECT * FROM distribution_subscribers");
    const byDist = new Map<number, DistSubscriber[]>();
    (sRows as any[]).forEach((r) => {
      const sub = mapSub(r);
      const arr = byDist.get(sub.distributorCode);
      if (arr) arr.push(sub); else byDist.set(sub.distributorCode, [sub]);
    });
    return NextResponse.json({
      distributors: (dRows as any[]).map((r) => ({
        ...mapDist(r),
        summary: summarize(byDist.get(r.code) ?? [], r.archived_removed ?? 0, now),
      })),
    });
  }

  const code = Number(codeParam);
  if (!Number.isInteger(code)) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  const [dRows] = await db.query("SELECT * FROM distribution_distributors WHERE code=?", [code]);
  const dist = (dRows as any[])[0];
  if (!dist) return NextResponse.json({ error: "Distributor not found" }, { status: 404 });
  const [sRows] = await db.query("SELECT * FROM distribution_subscribers WHERE distributor_code=? ORDER BY sub_code ASC", [code]);
  const all = (sRows as any[]).map(mapSub);

  const filter = params.get("status") || "active";
  const q = (params.get("q") || "").trim().toLowerCase();
  const rows = all.filter((s) => {
    const st = distStatus(s.expiryMonth, now);
    if (filter === "active" ? st === "removed" : filter !== "all" && st !== filter) return false;
    if (!q) return true;
    return [s.name, s.phone, s.address, String(s.subCode)].some((v) => (v || "").toLowerCase().includes(q));
  });

  return NextResponse.json({
    distributor: mapDist(dist),
    summary: summarize(all, dist.archived_removed ?? 0, now),
    subscribers: rows.map((s) => ({
      ...s,
      status: distStatus(s.expiryMonth, now),
      statusText: distStatusText(s.expiryMonth, now),
      monthsLeft: monthsLeft(s.expiryMonth, now),
    })),
  });
}

// Create (isNew) or update a distributor. `code` is the distributor number and
// can't be changed once created, since subscribers reference it.
// Optional login fields: username, password (blank = keep the current one), isActive.
export async function POST(req: Request) {
  const b = await req.json();
  const code = Number(b.code);
  const name = String(b.name || "").trim();
  if (!Number.isInteger(code) || code <= 0) {
    return NextResponse.json({ error: "Distributor code must be a positive number" }, { status: 400 });
  }
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const [existingRows] = await db.query("SELECT code, password FROM distribution_distributors WHERE code=?", [code]);
  const existing = (existingRows as any[])[0];
  if (b.isNew && existing) {
    return NextResponse.json({ error: `Distributor ${code} already exists` }, { status: 409 });
  }

  // Login credentials: only touched when the caller sends a `username` key.
  let credSql = "";
  const credVals: any[] = [];
  if (b.username !== undefined) {
    const username = String(b.username || "").trim();
    const password = String(b.password || "");
    if (username) {
      if (!/^[A-Za-z0-9._-]{3,60}$/.test(username)) {
        return NextResponse.json({ error: "Username: 3-60 letters, numbers, . _ - only" }, { status: 400 });
      }
      const [dup] = await db.query("SELECT code FROM distribution_distributors WHERE username=? AND code<>?", [username, code]);
      if ((dup as any[]).length > 0) {
        return NextResponse.json({ error: `Username "${username}" is already taken` }, { status: 409 });
      }
      if (!password && !existing?.password) {
        return NextResponse.json({ error: "Set a password for this login" }, { status: 400 });
      }
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    credSql = ", username=?, is_active=?";
    credVals.push(username || null, b.isActive === false ? 0 : 1);
    if (username && password) {
      credSql += ", password=?";
      credVals.push(await bcrypt.hash(password, 10));
    }
    if (!username) credSql += ", password=NULL";
  }

  const base = [name, b.phone?.trim() || null, b.state?.trim() || "DUBAI", b.area?.trim() || null];
  if (b.isNew) {
    await db.query(
      "INSERT INTO distribution_distributors (code,name,phone,state,area) VALUES (?,?,?,?,?)",
      [code, ...base]
    );
    if (credSql) {
      await db.query(`UPDATE distribution_distributors SET ${credSql.slice(2)} WHERE code=?`, [...credVals, code]);
    }
  } else {
    await db.query(
      `UPDATE distribution_distributors SET name=?, phone=?, state=?, area=?${credSql} WHERE code=?`,
      [...base, ...credVals, code]
    );
  }
  return NextResponse.json({ ok: true });
}

// Deleting a distributor also deletes their subscriber rows (FK cascade).
export async function DELETE(req: Request) {
  const code = Number(new URL(req.url).searchParams.get("code"));
  if (!Number.isInteger(code)) return NextResponse.json({ error: "code required" }, { status: 400 });
  await db.query("DELETE FROM distribution_distributors WHERE code=?", [code]);
  return NextResponse.json({ ok: true });
}
