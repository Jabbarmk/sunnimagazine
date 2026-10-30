import { NextResponse } from "next/server";
import db from "@/lib/db";
import { mapDist, mapSub } from "@/lib/distributionDb";
import { requireDistributor } from "@/lib/distributorAuth";
import { distStatus, distStatusText, monthsLeft, summarize } from "@/lib/distribution";

export const dynamic = "force-dynamic";

// The signed-in distributor's own profile, summary and subscriber list.
// Optional filters: ?status=active|all|safe|near|grace|overdue|removed (default active) and ?q=text.
export async function GET(req: Request) {
  const auth = await requireDistributor(req);
  if ("error" in auth) return auth.error;
  const { row } = auth;

  const params = new URL(req.url).searchParams;
  const now = new Date();
  const [sRows] = await db.query(
    "SELECT * FROM distribution_subscribers WHERE distributor_code=? ORDER BY sub_code ASC",
    [row.code]
  );
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
    distributor: mapDist(row),
    summary: summarize(all, row.archived_removed ?? 0, now),
    subscribers: rows.map((s) => ({
      ...s,
      status: distStatus(s.expiryMonth, now),
      statusText: distStatusText(s.expiryMonth, now),
      monthsLeft: monthsLeft(s.expiryMonth, now),
    })),
  });
}
