"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

const emptyDist = { code: "", name: "", phone: "", state: "DUBAI", area: "" };
const emptySub = { id: 0, distributorCode: "", subCode: "", name: "", phone: "", address: "", startMonth: "", expiryMonth: "", years: "" };

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [distFilter, setDistFilter] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

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
  const forceOpen = !!q || !!distFilter;
  const isOpen = (code: number) => forceOpen || expanded.has(code);
  const toggle = (code: number) =>
    setExpanded((p) => { const n = new Set(p); if (n.has(code)) n.delete(code); else n.add(code); return n; });

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
    setDistForm({ code: String(d.code), name: d.name, phone: d.phone, state: d.state, area: d.area, isNew: false });
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
      years: s.years == null ? "" : String(s.years),
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
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Distribution Management</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {loading ? "Loading…" : `${distributors.length} distributors · ${totals.active} copies on the active list`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={exportHref} download
            className={`px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-[12px] hover:bg-gray-50 ${loading || shownRows === 0 ? "pointer-events-none opacity-50" : ""}`}>
            ⬇ Export Excel ({shownRows})
          </a>
          <button onClick={openNewDistributor}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
            + Add Distributor
          </button>
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
            className={`rounded-xl border p-3 text-left transition-all ${cls} ${status === key ? "ring-2 ring-blue-400" : ""}`}>
            <div className="text-[22px] font-semibold leading-none">{count}</div>
            <div className="text-[11px] mt-1">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={distFilter} onChange={(e) => setDistFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-400 max-w-[280px]">
          <option value="">All distributors</option>
          {distributors.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.name}</option>)}
        </select>
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, address, code or distributor…"
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-400" />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[14px] leading-none">✕</button>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setStatus(f.key)}
            className={`px-3 py-1 rounded-full text-[12px] border transition-colors ${
              status === f.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
        {!forceOpen && groups.length > 0 && (
          <button
            onClick={() => setExpanded(expanded.size ? new Set() : new Set(groups.map((g) => g.d.code)))}
            className="ml-auto text-[12px] text-blue-600 hover:text-blue-800">
            {expanded.size ? "Collapse all" : "Expand all"}
          </button>
        )}
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
        <div className="space-y-3">
          {groups.map(({ d, all, rows }) => {
            const sum = summarize(all, d.archivedRemoved, now);
            const open = isOpen(d.code);
            return (
              <div key={d.code} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Distributor strip */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-gray-200 flex-wrap">
                  <button onClick={() => toggle(d.code)} className="flex items-center gap-3 flex-1 min-w-[260px] text-left" disabled={forceOpen}>
                    <span className="text-gray-400 text-[11px] w-3">{open ? "▼" : "▶"}</span>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Distributor {d.code}</span>
                    <span className="text-[14px] font-semibold text-gray-800">{d.name}</span>
                    <span className="text-[12px] text-gray-500">{d.phone}</span>
                    <span className="text-[12px] text-gray-400">{[d.state, d.area].filter(Boolean).join(" · ")}</span>
                  </button>
                  <span className="text-[12px] font-semibold text-gray-700">Total Copy: {sum.active}</span>
                  <div className="flex gap-1.5">
                    <RowActionButton variant="primary" onClick={() => { openNewSubscriber(d); }}>+ Subscriber</RowActionButton>
                    <RowActionButton onClick={() => openEditDistributor(d)}>Edit</RowActionButton>
                    <RowActionButton variant="danger" onClick={() => deleteDistributor(d)}>Delete</RowActionButton>
                  </div>
                </div>

                {open && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12.5px]">
                        <thead>
                          <tr className="text-left text-gray-500 bg-gray-50/60 border-b border-gray-200">
                            <th className="px-3 py-2 w-10 font-semibold">No</th>
                            <th className="px-3 py-2 w-16 font-semibold">Code</th>
                            <th className="px-3 py-2 font-semibold">Subscriber</th>
                            <th className="px-3 py-2 font-semibold">Delivery Address</th>
                            <th className="px-3 py-2 w-28 font-semibold">Subscription</th>
                            <th className="px-3 py-2 w-48 font-semibold">Status</th>
                            <th className="px-3 py-2 w-28" />
                          </tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 && (
                            <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                              {all.length === 0 ? "No subscribers on this list yet." : "No subscribers match the current filters."}
                            </td></tr>
                          )}
                          {rows.map((s, i) => {
                            const st = distStatus(s.expiryMonth, now);
                            const meta = STATUS_META[st];
                            const left = monthsLeft(s.expiryMonth, now);
                            const txt = distStatusText(s.expiryMonth, now);
                            return (
                              <tr key={s.id} className={`border-b border-gray-100 last:border-0 align-top ${meta.row}`}>
                                <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                <td className="px-3 py-2 text-gray-600">{s.subCode}</td>
                                <td className="px-3 py-2">
                                  <div className="font-medium text-gray-800">{s.name}</div>
                                  <div className="text-[11.5px] text-gray-500">{s.phone}</div>
                                </td>
                                <td className="px-3 py-2 text-gray-600">{s.address}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <div className="text-gray-600">{fmtMonth(s.startMonth)}{s.years != null && <span className="text-gray-400"> · {s.years}</span>}</div>
                                  <div className="font-medium text-gray-800">{fmtMonth(s.expiryMonth)}{left !== null && <span className="text-gray-400 font-normal"> · {left}</span>}</div>
                                </td>
                                <td className="px-3 py-2">
                                  {txt && <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>{txt}</span>}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-1.5 justify-end">
                                    <button onClick={() => openEditSubscriber(s)} className="text-[12px] text-gray-500 hover:text-gray-800">Edit</button>
                                    <button onClick={() => deleteSubscriber(s)} className="text-[12px] text-red-400 hover:text-red-600">Remove</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Footer summary, same columns as the report */}
                    <div className="grid grid-cols-7 text-center border-t border-gray-200 bg-gray-50 text-[11px]">
                      {([
                        ["Safe", sum.safe], ["Near Expiry", sum.near], ["Grace Period", sum.grace], ["Over Due", sum.overdue],
                        ["Removed", sum.removed], ["Total", sum.total], ["Active", sum.active],
                      ] as [string, number][]).map(([label, n]) => (
                        <div key={label} className="py-2 border-r border-gray-200 last:border-r-0">
                          <div className="text-gray-400">{label}</div>
                          <div className="text-[14px] font-semibold text-gray-800">{n}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {!open && (
                  <div className="px-4 py-2 text-[11.5px] text-gray-500 flex gap-4 flex-wrap">
                    <span>Safe {sum.safe}</span>
                    <span className={sum.near ? "text-amber-600 font-medium" : ""}>Near Expiry {sum.near}</span>
                    <span className={sum.grace + sum.overdue ? "text-red-500 font-medium" : ""}>Grace / Over Due {sum.grace + sum.overdue}</span>
                    <span>Removed {sum.removed}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
