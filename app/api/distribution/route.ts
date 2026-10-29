import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// Everything the Distribution page needs in one call: all distributors plus
// every subscriber on their lists (status is computed client-side from expiry).
export async function GET() {
  const [dRows] = await db.query("SELECT * FROM distribution_distributors ORDER BY code ASC");
  const [sRows] = await db.query("SELECT * FROM distribution_subscribers ORDER BY distributor_code ASC, sub_code ASC");
  return NextResponse.json({
    distributors: (dRows as any[]).map((r) => ({
      code: r.code,
      name: r.name,
      phone: r.phone ?? "",
      state: r.state ?? "",
      area: r.area ?? "",
      archivedRemoved: r.archived_removed ?? 0,
    })),
    subscribers: (sRows as any[]).map((r) => ({
      id: r.id,
      distributorCode: r.distributor_code,
      subCode: r.sub_code,
      name: r.name,
      phone: r.phone ?? "",
      address: r.address ?? "",
      startMonth: r.start_month ?? "",
      expiryMonth: r.expiry_month ?? "",
      years: r.years ?? null,
    })),
  });
}
