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
