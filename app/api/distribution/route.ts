import { NextResponse } from "next/server";
import db from "@/lib/db";
import { mapDist, mapSub } from "@/lib/distributionDb";

export const dynamic = "force-dynamic";

// Everything the Distribution page needs in one call: all distributors plus
// every subscriber on their lists (status is computed client-side from expiry).
export async function GET() {
  const [dRows] = await db.query("SELECT * FROM distribution_distributors ORDER BY code ASC");
  const [sRows] = await db.query("SELECT * FROM distribution_subscribers ORDER BY distributor_code ASC, sub_code ASC");
  return NextResponse.json({
    distributors: (dRows as any[]).map(mapDist),
    subscribers: (sRows as any[]).map(mapSub),
  });
}
