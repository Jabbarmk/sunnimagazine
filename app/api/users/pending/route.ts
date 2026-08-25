import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// New registrations awaiting approval: active, not deleted, and no
// subscription at all — neither a history row nor cached dates on the user.
export async function GET() {
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.mobile, u.whatsapp, u.code, u.location,
            u.emirates, u.referred_by, u.referral_mobile, u.password, u.created_at
     FROM app_users u
     WHERE u.deleted_at IS NULL AND u.is_active=1
       AND (u.subscription_from IS NULL OR u.subscription_from='')
       AND (u.subscription_to IS NULL OR u.subscription_to='')
       AND NOT EXISTS (SELECT 1 FROM user_subscriptions s WHERE s.user_id=u.id)
     ORDER BY u.created_at DESC`
  );
  return NextResponse.json((rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    mobile: r.mobile ?? "",
    whatsapp: r.whatsapp ?? "",
    code: r.code ?? "",
    location: r.location ?? "",
    emirates: r.emirates ?? "",
    referredBy: r.referred_by ?? "",
    referralMobile: r.referral_mobile ?? "",
    hasPassword: !!(r.password && String(r.password).length > 0),
    createdAt: r.created_at ?? null,
  })));
}
