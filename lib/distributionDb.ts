// Row -> JSON mappers shared by the distribution API routes. Server only.
// The password hash is never mapped out; callers only learn whether one is set.
import type { DistSubscriber } from "@/lib/distribution";

export const mapSub = (r: any): DistSubscriber => ({
  id: r.id,
  distributorCode: r.distributor_code,
  subCode: r.sub_code,
  name: r.name,
  phone: r.phone ?? "",
  address: r.address ?? "",
  startMonth: r.start_month ?? "",
  expiryMonth: r.expiry_month ?? "",
  years: r.years ?? null,
  remark: r.remark ?? "",
  updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : "",
});

export const mapDist = (r: any) => ({
  code: r.code,
  name: r.name,
  phone: r.phone ?? "",
  state: r.state ?? "",
  area: r.area ?? "",
  archivedRemoved: r.archived_removed ?? 0,
  username: r.username ?? "",
  isActive: r.is_active == null ? true : !!r.is_active,
  hasPassword: !!r.password,
  lastLogin: r.last_login ? new Date(r.last_login).toISOString() : "",
});

// Delivery-report tables (see migrate_delivery_report.sql). Created on first use so a server
// where the migration was never run does not return 500 on the delivery routes.
let deliveryTablesReady: Promise<void> | null = null;
export function ensureDeliveryTables(): Promise<void> {
  if (!deliveryTablesReady) {
    deliveryTablesReady = (async () => {
      const { default: db } = await import("@/lib/db");
      await db.query(`CREATE TABLE IF NOT EXISTS distribution_delivery_reports (
        id int(11) NOT NULL AUTO_INCREMENT,
        distributor_code int(11) NOT NULL,
        month char(7) NOT NULL,
        note varchar(1000) DEFAULT NULL,
        submitted_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY uq_dist_month (distributor_code, month)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
      await db.query(`CREATE TABLE IF NOT EXISTS distribution_delivery_items (
        id int(11) NOT NULL AUTO_INCREMENT,
        report_id int(11) NOT NULL,
        sub_id int(11) NOT NULL,
        delivered tinyint(1) NOT NULL DEFAULT 1,
        issue varchar(500) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_report_sub (report_id, sub_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    })().catch((e) => { deliveryTablesReady = null; throw e; });
  }
  return deliveryTablesReady;
}
