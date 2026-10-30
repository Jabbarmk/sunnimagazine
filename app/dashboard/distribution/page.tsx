"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { isSuperAdmin } from "@/lib/auth";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";
import {
  distStatus, distStatusText, fmtMonth, monthsLeft, summarize,
  type Distributor, type DistSubscriber, type DistStatus,
} from "@/lib/distribution";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StatusFilter = "active" | "all" | DistStatus;

const STATUS_META: Record<DistStatus, { label: string; badge: string; row: string; card: string }> = {
  safe:    { label: "Safe",         badge: "bg-green-50 text-green-700 border-green-200", row: "",                          card: "bg-green-50 border-green-200 text-green-700" },
  near:    { label: "Near Expiry",  badge: "bg-amber-50 text-amber-700 border-amber-200", row: "bg-amber-50/40",            card: "bg-amber-50 border-amber-200 text-amber-700" },
  grace:   { label: "Grace Period", badge: "bg-red-50 text-red-600 border-red-200",       row: "bg-red-50/40",              card: "bg-red-50 border-red-200 text-red-600" },
  overdue: { label: "Over Due",     badge: "bg-red-100 text-red-700 border-red-300",      row: "bg-red-100/50",             card: "bg-red-100 border-red-300 text-red-700" },
  removed: { label: "Removed",      badge: "bg-gray-100 text-gray-500 border-gray-200",   row: "bg-gray-50 text-gray-400",  card: "bg-gray-100 border-gray-200 text-gray-500" },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "safe", label: "Safe" },
  { key: "near", label: "Near Expiry" },
  { key: "grace", label: "Grace Period" },
  { key: "overdue", label: "Over Due" },
  { key: "removed", label: "Removed" },
  { key: "all", label: "All" },
];

function matchesStatus(f: StatusFilter, st: DistStatus) {
  if (f === "all") return true;
  if (f === "active") return st !== "removed";
  return st === f;
}

const emptyDist = { code: "", name: "", phone: "", state: "DUBAI", area: "", username: "", password: "", isActive: true };
const emptySub = { id: 0, distributorCode: "", subCode: "", name: "", phone: "", address: "", startMonth: "", expiryMonth: "", years: "", remark: "" };

const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`/api/distribution${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DistributionPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [subscribers, setSubscribers] = useState<DistSubscriber[]>([]);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [distFilter, setDistFilter] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [detailCode, setDetailCode] = useState<number | null>(null);

  const [distForm, setDistForm] = useState<(typeof emptyDist & { isNew: boolean }) | null>(null);
  const [subForm, setSubForm] = useState<typeof emptySub | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api("");
      setDistributors(data.distributors);
      setSubscribers(data.subscribers);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { setSuperAdmin(isSuperAdmin()); }, []);

  const now = useMemo(() => new Date(), []);
  const q = search.trim().toLowerCase();

  const byDist = useMemo(() => {
    const m = new Map<number, DistSubscriber[]>();
    subscribers.forEach((s) => {
      const arr = m.get(s.distributorCode);
      if (arr) arr.push(s); else m.set(s.distributorCode, [s]);
    });
    return m;
  }, [subscribers]);

  const totals = useMemo(() => {
    const t = { safe: 0, near: 0, grace: 0, overdue: 0, removed: 0, active: 0 };
    distributors.forEach((d) => {
      const s = summarize(byDist.get(d.code) ?? [], d.archivedRemoved, now);
      t.safe += s.safe; t.near += s.near; t.grace += s.grace; t.overdue += s.overdue;
      t.removed += s.removed; t.active += s.active;
    });
    return t;
  }, [distributors, byDist, now]);

  // Distributors with their rows after the status/search filters.
  const groups = useMemo(() => {
    const filtering = !!q || status !== "active";
    return distributors
      .filter((d) => !distFilter || String(d.code) === distFilter)
      .map((d) => {
        const all = byDist.get(d.code) ?? [];
        const rows = all.filter((s) => {
          if (!matchesStatus(status, distStatus(s.expiryMonth, now))) return false;
          if (!q) return true;
          return [s.name, s.phone, s.address, String(s.subCode)].some((v) => (v || "").toLowerCase().includes(q))
            || d.name.toLowerCase().includes(q);
        });
        return { d, all, rows };
      })
      .filter((g) => !filtering || g.rows.length > 0 || String(g.d.code) === distFilter);
  }, [distributors, byDist, distFilter, status, q, now]);

  const shownRows = groups.reduce((n, g) => n + g.rows.length, 0);
  const detail = detailCode == null ? null : distributors.find((d) => d.code === detailCode) ?? null;

  const exportHref = `/api/distribution/export?${new URLSearchParams({
    ...(distFilter ? { distributor: distFilter } : {}),
    ...(status !== "all" ? { status } : {}),
    ...(q ? { q } : {}),
  }).toString()}`;

  // ── Distributor actions ──
  const openNewDistributor = () => {
    const next = distributors.reduce((m, d) => Math.max(m, d.code), 0) + 1;
    setFormError("");
    setDistForm({ ...emptyDist, code: String(next), isNew: true });
  };
  const openEditDistributor = (d: Distributor) => {
    setFormError("");
    setDistForm({
      code: String(d.code), name: d.name, phone: d.phone, state: d.state, area: d.area, isNew: false,
      username: d.username ?? "", password: "", isActive: d.isActive !== false,
    });
  };
  const saveDistributor = async () => {
    if (!distForm) return;
    setSaving(true); setFormError("");
    try {
      await api("/distributors", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(distForm),
      });
      setDistForm(null);
      await reload();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };
  const deleteDistributor = async (d: Distributor) => {
    const n = (byDist.get(d.code) ?? []).length;
    if (!confirm(`Delete distributor ${d.code} · ${d.name}${n ? ` and its ${n} subscriber(s)` : ""}? This cannot be undone.`)) return;
    try {
      await api(`/distributors?code=${d.code}`, { method: "DELETE" });
      setDetailCode(null);
      await reload();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed"); }
  };

  // ── Subscriber actions ──
  const openNewSubscriber = (d: Distributor) => {
    const next = subscribers.reduce((m, s) => Math.max(m, s.subCode), 0) + 1;
    setFormError("");
    setSubForm({ ...emptySub, distributorCode: String(d.code), subCode: String(next) });
  };
  const openEditSubscriber = (s: DistSubscriber) => {
    setFormError("");
    setSubForm({
      id: s.id, distributorCode: String(s.distributorCode), subCode: String(s.subCode), name: s.name,
      phone: s.phone, address: s.address, startMonth: s.startMonth, expiryMonth: s.expiryMonth,
      years: s.years == null ? "" : String(s.years), remark: s.remark ?? "",
    });
  };
  const saveSubscriber = async () => {
    if (!subForm) return;
    setSaving(true); setFormError("");
    try {
      await api("/subscribers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subForm, id: subForm.id || undefined }),
      });
      setSubForm(null);
      await reload();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };
  const deleteSubscriber = async (s: DistSubscriber) => {
    if (!confirm(`Remove ${s.name} (${s.subCode}) from the distribution list?`)) return;
    try {
      await api(`/subscribers?id=${s.id}`, { method: "DELETE" });
      await reload();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed"); }
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-[26px] font-semibold text-gray-900">Distribution Management</h1>
          <p className="text-[15px] text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${distributors.length} distributors · ${totals.active} copies on the active list`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={exportHref} download
            className={`px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-[12px] hover:bg-gray-50 ${loading || shownRows === 0 ? "pointer-events-none opacity-50" : ""}`}>
            ⬇ Export Excel ({shownRows})
          </a>
          {superAdmin && (
            <button onClick={openNewDistributor}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
              + Add Distributor
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="mb-4 text-[13px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {loadError}. If this is a new setup, run <b>migrate_distribution.sql</b> on the database first.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-4">
        {([
          ["active", totals.active, "Active", "bg-white border-gray-200 text-gray-700"],
          ["safe", totals.safe, STATUS_META.safe.label, STATUS_META.safe.card],
          ["near", totals.near, STATUS_META.near.label, STATUS_META.near.card],
          ["grace", totals.grace, STATUS_META.grace.label, STATUS_META.grace.card],
          ["overdue", totals.overdue, STATUS_META.overdue.label, STATUS_META.overdue.card],
          ["removed", totals.removed, STATUS_META.removed.label, STATUS_META.removed.card],
        ] as [StatusFilter, number, string, string][]).map(([key, count, label, cls]) => (
          <button key={key}
            onClick={() => setStatus(key)}
            className={`rounded-2xl border p-4 text-left transition-all ${cls} ${status === key ? "ring-2 ring-blue-400" : ""}`}>
            <div className="text-[34px] font-bold leading-none">{count}</div>
            <div className="text-[14px] font-medium mt-2">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={distFilter} onChange={(e) => setDistFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] outline-none focus:border-blue-400 max-w-[320px]">
          <option value="">All distributors</option>
          {distributors.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.name}</option>)}
        </select>
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, address, code or distributor…"
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] outline-none focus:border-blue-400" />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[14px] leading-none">✕</button>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setStatus(f.key)}
            className={`px-4 py-1.5 rounded-full text-[13.5px] border transition-colors ${
              status === f.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Distributors */}
      {loading ? (
        <SkeletonRows count={4} />
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-10 text-center text-[13px] text-gray-400">
          {distributors.length === 0
            ? "No distributors yet. Add one, or run seed_distribution.sql to load the Distributor-wise List."
            : "No subscribers match the current filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {groups.map(({ d, all, rows }) => {
            const sum = summarize(all, d.archivedRemoved, now);
            const filtered = !!q || status !== "active";
            return (
              <div key={d.code} onClick={() => setDetailCode(d.code)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setDetailCode(d.code); }}
                className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-800 text-white flex items-center justify-center text-[20px] font-bold">{d.code}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[19px] font-semibold text-gray-900 leading-snug">{d.name}</div>
                    <div className="text-[14.5px] text-gray-600 mt-0.5">{d.phone || "—"}</div>
                    <div className="text-[13.5px] text-gray-400">{[d.state, d.area].filter(Boolean).join(" · ")}</div>
                    <div className="mt-1.5">
                      {d.username
                        ? <span className={`inline-block text-[12px] px-2 py-0.5 rounded-full border ${d.isActive === false ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                            🔑 {d.username}{d.isActive === false ? " · disabled" : ""}
                          </span>
                        : <span className="inline-block text-[12px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-400">No login</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[34px] font-bold text-gray-900 leading-none">{sum.active}</div>
                    <div className="text-[12px] text-gray-500 mt-1">Total Copy</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mt-4">
                  {([
                    ["Safe", sum.safe, STATUS_META.safe.card],
                    ["Near", sum.near, STATUS_META.near.card],
                    ["Grace", sum.grace, STATUS_META.grace.card],
                    ["Over Due", sum.overdue, STATUS_META.overdue.card],
                    ["Removed", sum.removed, STATUS_META.removed.card],
                  ] as [string, number, string][]).map(([label, n, cls]) => (
                    <div key={label} className={`rounded-xl border py-2 text-center ${cls} ${n === 0 ? "opacity-50" : ""}`}>
                      <div className="text-[22px] font-bold leading-none">{n}</div>
                      <div className="text-[12px] mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 text-[13.5px]">
                  <span className="text-gray-500">
                    {filtered ? <><b className="text-gray-800">{rows.length}</b> matching · </> : null}Total {sum.total}
                  </span>
                  <span className="text-blue-600 font-medium">View details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-screen distributor detail */}
      {detail && (
        <DistributorDetail
          d={detail}
          subs={byDist.get(detail.code) ?? []}
          now={now}
          initialStatus={status}
          initialSearch={search}
          canManage={superAdmin}
          onClose={() => setDetailCode(null)}
          onAddSub={() => openNewSubscriber(detail)}
          onEditSub={openEditSubscriber}
          onDeleteSub={deleteSubscriber}
          onEditDist={() => openEditDistributor(detail)}
          onDeleteDist={() => deleteDistributor(detail)}
        />
      )}

      {/* Distributor form */}
      {distForm && (
        <Modal title={distForm.isNew ? "Add Distributor" : `Edit Distributor ${distForm.code}`} onClose={() => setDistForm(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Distributor No *">
              <input className={inp} value={distForm.code} disabled={!distForm.isNew}
                onChange={(e) => setDistForm({ ...distForm, code: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field label="Name *">
              <input className={inp} value={distForm.name} onChange={(e) => setDistForm({ ...distForm, name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className={inp} value={distForm.phone} onChange={(e) => setDistForm({ ...distForm, phone: e.target.value })} placeholder="055-7862016" />
            </Field>
            <Field label="State">
              <input className={inp} value={distForm.state} onChange={(e) => setDistForm({ ...distForm, state: e.target.value })} />
            </Field>
            <div className="col-span-2">
              <Field label="Area">
                <input className={inp} value={distForm.area} onChange={(e) => setDistForm({ ...distForm, area: e.target.value })} placeholder="e.g. DEIRA" />
              </Field>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Distributor login</div>
            <p className="text-[12px] text-gray-500 mb-3">
              Lets this distributor sign in at <b>/distributor</b> or in the mobile app and update their own subscribers. Leave the username empty to disable login.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username">
                <input className={inp} value={distForm.username} autoComplete="off"
                  onChange={(e) => setDistForm({ ...distForm, username: e.target.value.replace(/\s/g, "") })} placeholder="e.g. dist12" />
              </Field>
              <Field label={distForm.isNew ? "Password" : "New password (blank = keep)"}>
                <input className={inp} type="text" value={distForm.password} autoComplete="new-password"
                  onChange={(e) => setDistForm({ ...distForm, password: e.target.value })} placeholder="min 6 characters" />
              </Field>
            </div>
            <label className="flex items-center gap-2 mt-3 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={distForm.isActive} onChange={(e) => setDistForm({ ...distForm, isActive: e.target.checked })} />
              Login enabled
            </label>
          </div>
          <FormFooter error={formError} saving={saving} onSave={saveDistributor} onCancel={() => setDistForm(null)} />
        </Modal>
      )}

      {/* Subscriber form */}
      {subForm && (
        <Modal title={subForm.id ? "Edit Subscriber" : "Add Subscriber"} onClose={() => setSubForm(null)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Distributor *">
                <select className={inp + " bg-white"} value={subForm.distributorCode}
                  onChange={(e) => setSubForm({ ...subForm, distributorCode: e.target.value })}>
                  {distributors.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Subscriber Code *">
              <input className={inp} value={subForm.subCode} onChange={(e) => setSubForm({ ...subForm, subCode: e.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field label="Name *">
              <input className={inp} value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className={inp} value={subForm.phone} onChange={(e) => setSubForm({ ...subForm, phone: e.target.value })} placeholder="050-1234567" />
            </Field>
            <Field label="Years">
              <input className={inp} value={subForm.years} onChange={(e) => setSubForm({ ...subForm, years: e.target.value.replace(/\D/g, "") })} placeholder="optional" />
            </Field>
            <div className="col-span-2">
              <Field label="Delivery Address">
                <input className={inp} value={subForm.address} onChange={(e) => setSubForm({ ...subForm, address: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Remark">
                <input className={inp} value={subForm.remark} maxLength={255} onChange={(e) => setSubForm({ ...subForm, remark: e.target.value })} placeholder="optional note" />
              </Field>
            </div>
            <Field label="Start Month">
              <input type="month" className={inp} value={subForm.startMonth} onChange={(e) => setSubForm({ ...subForm, startMonth: e.target.value })} />
            </Field>
            <Field label="Expiry Month * (last issue)">
              <input type="month" className={inp} value={subForm.expiryMonth} onChange={(e) => setSubForm({ ...subForm, expiryMonth: e.target.value })} />
            </Field>
          </div>
          <FormFooter error={formError} saving={saving} onSave={saveSubscriber} onCancel={() => setSubForm(null)} />
        </Modal>
      )}
    </div>
  );
}

// ─── Full-screen detail ───────────────────────────────────────────────────────

function DistributorDetail({ d, subs, now, initialStatus, initialSearch, canManage, onClose, onAddSub, onEditSub, onDeleteSub, onEditDist, onDeleteDist }: {
  d: Distributor; subs: DistSubscriber[]; now: Date; initialStatus: StatusFilter; initialSearch: string; canManage: boolean;
  onClose: () => void; onAddSub: () => void; onEditSub: (s: DistSubscriber) => void; onDeleteSub: (s: DistSubscriber) => void;
  onEditDist: () => void; onDeleteDist: () => void;
}) {
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const sum = summarize(subs, d.archivedRemoved, now);
  const q = search.trim().toLowerCase();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const rows = subs.filter((s) => {
    if (!matchesStatus(status, distStatus(s.expiryMonth, now))) return false;
    if (!q) return true;
    return [s.name, s.phone, s.address, String(s.subCode)].some((v) => (v || "").toLowerCase().includes(q));
  });

  const exportHref = `/api/distribution/export?${new URLSearchParams({
    distributor: String(d.code),
    ...(status !== "all" ? { status } : {}),
    ...(q ? { q } : {}),
  }).toString()}`;

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-wrap">
        <button onClick={onClose} className="px-3 py-2 border border-gray-200 rounded-lg text-[14px] text-gray-600 hover:bg-gray-50">← Back</button>
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center text-[18px] font-bold">{d.code}</div>
        <div className="flex-1 min-w-[220px]">
          <div className="text-[22px] font-semibold text-gray-900 leading-tight">{d.name}</div>
          <div className="text-[14px] text-gray-500">{[d.phone, d.state, d.area].filter(Boolean).join(" · ")}{d.username ? ` · 🔑 ${d.username}` : ""}</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href={exportHref} download className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-[14px] hover:bg-gray-50">⬇ Export</a>
          <button onClick={onAddSub} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700">+ Subscriber</button>
          {canManage && <button onClick={onEditDist} className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-[14px] hover:bg-gray-50">Edit</button>}
          {canManage && <button onClick={onDeleteDist} className="px-3 py-2 border border-red-200 text-red-500 rounded-lg text-[14px] hover:bg-red-50">Delete</button>}
          <button onClick={onClose} aria-label="Close" className="px-3 py-2 text-gray-400 hover:text-gray-700 text-[20px] leading-none">✕</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-6">
          {/* Summary */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
            {([
              ["Active", sum.active, "bg-white border-gray-200 text-gray-800", "active"],
              ["Safe", sum.safe, STATUS_META.safe.card, "safe"],
              ["Near Expiry", sum.near, STATUS_META.near.card, "near"],
              ["Grace Period", sum.grace, STATUS_META.grace.card, "grace"],
              ["Over Due", sum.overdue, STATUS_META.overdue.card, "overdue"],
              ["Removed", sum.removed, STATUS_META.removed.card, null],
              ["Total", sum.total, "bg-white border-gray-200 text-gray-800", "all"],
            ] as [string, number, string, StatusFilter | null][]).map(([label, n, cls, key]) => (
              <button key={label} disabled={!key} onClick={() => key && setStatus(key)}
                className={`rounded-2xl border p-4 text-left ${cls} ${key && status === key ? "ring-2 ring-blue-400" : ""}`}>
                <div className="text-[34px] font-bold leading-none">{n}</div>
                <div className="text-[14px] font-medium mt-2">{label}</div>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, address, code…"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] outline-none focus:border-blue-400" />
            </div>
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setStatus(f.key)}
                className={`px-4 py-1.5 rounded-full text-[13.5px] border transition-colors ${
                  status === f.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-[14px] text-gray-500">{rows.length} of {subs.length} shown</span>
          </div>

          {/* Subscribers */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-200 text-[13px] uppercase tracking-wide">
                    <th className="px-4 py-3 w-12 font-semibold">No</th>
                    <th className="px-4 py-3 w-20 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Subscriber</th>
                    <th className="px-4 py-3 font-semibold">Delivery Address</th>
                    <th className="px-4 py-3 w-36 font-semibold">Subscription</th>
                    <th className="px-4 py-3 w-52 font-semibold">Status</th>
                    <th className="px-4 py-3 w-28" />
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      {subs.length === 0 ? "No subscribers on this list yet." : "No subscribers match the current filters."}
                    </td></tr>
                  )}
                  {rows.map((s, i) => {
                    const st = distStatus(s.expiryMonth, now);
                    const meta = STATUS_META[st];
                    const left = monthsLeft(s.expiryMonth, now);
                    const txt = distStatusText(s.expiryMonth, now);
                    return (
                      <tr key={s.id} className={`border-b border-gray-100 last:border-0 align-top ${meta.row}`}>
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-600">{s.subCode}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="text-[13.5px] text-gray-500">{s.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{s.address}{s.remark && <div className="text-[13px] text-blue-600 mt-0.5">📝 {s.remark}</div>}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-gray-600">{fmtMonth(s.startMonth)}{s.years != null && <span className="text-gray-400"> · {s.years}</span>}</div>
                          <div className="font-semibold text-gray-900">{fmtMonth(s.expiryMonth)}{left !== null && <span className="text-gray-400 font-normal"> · {left}</span>}</div>
                        </td>
                        <td className="px-4 py-3">
                          {txt && <span className={`inline-block text-[13px] px-2.5 py-1 rounded-full border font-medium ${meta.badge}`}>{txt}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3 justify-end text-[14px]">
                            <button onClick={() => onEditSub(s)} className="text-gray-500 hover:text-gray-900">Edit</button>
                            <button onClick={() => onDeleteSub(s)} className="text-red-400 hover:text-red-600">Remove</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function FormFooter({ error, saving, onSave, onCancel }: { error: string; saving: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <>
      {error && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-4">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button onClick={onSave} disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </>
  );
}
