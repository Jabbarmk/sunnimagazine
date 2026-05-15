import { NextResponse } from "next/server";
import db from "@/lib/db";
import { DEFAULT_EDITORIAL } from "@/lib/editorial";

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS magazine_editorial (
      magazine_id VARCHAR(100) PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const magazineId = searchParams.get("magazineId");

  try {
    await ensureTable();

    if (magazineId) {
      const [rows] = await db.query(
        "SELECT data FROM magazine_editorial WHERE magazine_id = ?",
        [magazineId]
      );
      const r = (rows as any[])[0];
      if (r) {
        return NextResponse.json({ magazineId, ...DEFAULT_EDITORIAL, ...JSON.parse(r.data) });
      }
      // Fall back to global editorial
      const [global] = await db.query("SELECT data FROM editorial WHERE id=1");
      const g = (global as any[])[0];
      return NextResponse.json({ magazineId: null, ...DEFAULT_EDITORIAL, ...(g ? JSON.parse(g.data) : {}) });
    }

    // No magazineId: return most recently updated per-magazine editorial
    const [recent] = await db.query(
      "SELECT magazine_id, data FROM magazine_editorial ORDER BY updated_at DESC LIMIT 1"
    );
    const r = (recent as any[])[0];
    if (r) {
      return NextResponse.json({ magazineId: r.magazine_id, ...DEFAULT_EDITORIAL, ...JSON.parse(r.data) });
    }

    // Fall back to global editorial
    const [global] = await db.query("SELECT data FROM editorial WHERE id=1");
    const g = (global as any[])[0];
    return NextResponse.json({ magazineId: null, ...DEFAULT_EDITORIAL, ...(g ? JSON.parse(g.data) : {}) });

  } catch {
    return NextResponse.json({ magazineId: null, ...DEFAULT_EDITORIAL });
  }
}

export async function POST(req: Request) {
  const { magazineId, ...data } = await req.json();

  try {
    await ensureTable();

    if (magazineId) {
      await db.query(
        `INSERT INTO magazine_editorial (magazine_id, data) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE data=VALUES(data), updated_at=CURRENT_TIMESTAMP`,
        [magazineId, JSON.stringify(data)]
      );
    } else {
      await db.query(
        `INSERT INTO editorial (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data=VALUES(data)`,
        [JSON.stringify(data)]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
