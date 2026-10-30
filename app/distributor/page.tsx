"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fmtMonth, type DistStatus, type DistSummary } from "@/lib/distribution";

// Distributor portal: a distributor signs in with the username/password the super admin
// gave them, sees only their own subscriber list, and updates a subscriber's status
// (expiry/renewal), contact details and remark. Every call carries a signed token that the
// server checks, so a distributor can never touch another list.

const TOKEN_KEY = "gs_distributor_token_v1";

type Sub = {
  id: number; subCode: number; name: string; phone: string; address: string;
  startMonth: string; expiryMonth: string; years: number | null; remark: string;
  status: DistStatus; statusText: string; monthsLeft: number | null;
};
type Me = {
  distributor: { code: number; name: string; phone: string; state: string; area: string };
  summary: DistSummary;
  subscribers: Sub[];
};
type StatusFilter = "active" | "all" | DistStatus;

const META: Record<DistStatus, { label: string; badge: string; row: string; card: string }> = {
  safe:    { label: "Safe",         badge: "bg-green-50 text-green-700 border-green-200", row: "border-l-4 border-l-green-400",  card: "bg-green-50 border-green-200 text-green-700" },
  near:    { label: "Near Expiry",  badge: "bg-amber-50 text-amber-700 border-amber-200", row: "border-l-4 border-l-amber-400",  card: "bg-amber-50 border-amber-200 text-amber-700" },
  grace:   { label: "Grace Period", badge: "bg-red-50 text-red-600 border-red-200",       row: "border-l-4 border-l-red-400",    card: "bg-red-50 border-red-200 text-red-600" },
  overdue: { label: "Over Due",     badge: "bg-red-100 text-red-700 border-red-300",      row: "border-l-4 border-l-red-600",    card: "bg-red-100 border-red-300 text-red-700" },
  removed: { label: "Removed",      badge: "bg-gray-100 text-gray-500 border-gray-200",   row: "border-l-4 border-l-gray-300",   card: "bg-gray-100 border-gray-200 text-gray-500" },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "active", label: "Active" }, { key: "safe", label: "Safe" }, { key: "near", label: "Near Expiry" },
  { key: "grace", label: "Grace" }, { key: "overdue", label: "Over Due" }, { key: "removed", label: "Removed" }, { key: "all", label: "All" },
];

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-blue-400 bg-white";

function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; } }

class AuthError extends Error {}

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`/api/distributor${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && getToken()) throw new AuthError(data?.error || "Please sign in again");
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// "2026-10" + n months, never earlier than the current month (renewing a lapsed subscriber starts from today).
function renewFrom(expiry: string, add: number): string {
  const now = new Date();
  const cur = now.getFullYear() * 12 + now.getMonth();
  const m = /^(\d{4})-(\d{2})$/.exec(expiry || "");
  const base = Math.max(cur, m ? Number(m[1]) * 12 + Number(m[2]) - 1 : cur) + add;
  return `${Math.floor(base / 12)}-${String((base % 12) + 1).padStart(2, "0")}`;
}

export default function DistributorPortal() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => { setSignedIn(!!getToken()); setReady(true); }, []);
  // Stable identity: Portal's load() depends on it, so a new function each render would refetch forever.
  const logout = useCallback(() => { try { localStorage.removeItem(TOKEN_KEY); } catch {} setSignedIn(false); }, []);

  if (!ready) return null;
  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;
  return <Portal onLogout={logout} />;
}

// ─── Login ────────────────────────────────────────────────────────────────────

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) { setError("Enter your username and password."); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/distributor/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Sign in failed");
      localStorage.setItem(TOKEN_KEY, data.token);
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[15px] font-semibold text-slate-800">Gulf Sathyadhara</div>
          <div className="text-[13px] text-gray-400">Distributor Login</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
          <h1 className="text-[22px] font-semibold text-gray-900">Sign in</h1>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Username</label>
            <input className={inp} value={username} autoCapitalize="none" autoComplete="username"
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Password</label>
            <input className={inp} type="password" value={password} autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <button onClick={submit} disabled={busy}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-[15px] font-medium hover:bg-blue-700 disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-[12px] text-gray-400 text-center">Forgot your login? Contact the Gulf Sathyadhara office.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Portal ───────────────────────────────────────────────────────────────────

function Portal({ onLogout }: { onLogout: () => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      // Fetch everything once; filtering is instant on the client.
      setMe(await call("/me?status=all"));
      setError("");
    } catch (e: unknown) {
      if (e instanceof AuthError) { onLogout(); return; }
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoading(false); }
  }, [onLogout]);

  useEffect(() => { load(); }, [load]);

  const q = search.trim().toLowerCase();
  const rows = useMemo(() => (me?.subscribers ?? []).filter((s) => {
    if (status === "active" ? s.status === "removed" : status !== "all" && s.status !== status) return false;
    if (!q) return true;
    return [s.name, s.phone, s.address, String(s.subCode)].some((v) => (v || "").toLowerCase().includes(q));
  }), [me, status, q]);

  const editing = me?.subscribers.find((s) => s.id === editId) ?? null;
  const sum = me?.summary;
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center text-[18px] font-bold">{me?.distributor.code ?? "·"}</div>
        <div className="flex-1 min-w-[200px]">
          <div className="text-[22px] font-semibold text-gray-900 leading-tight">{me?.distributor.name ?? "Distributor"}</div>
          <div className="text-[14px] text-gray-500">{me ? [me.distributor.phone, me.distributor.state, me.distributor.area].filter(Boolean).join(" · ") : ""}</div>
        </div>
        <button onClick={() => setShowPw(true)} className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-[14px] hover:bg-gray-50">Change password</button>
        <button onClick={onLogout} className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-[14px] hover:bg-gray-50">Logout</button>
      </div>

      <div className="max-w-[1200px] mx-auto p-6">
        {error && <div className="mb-4 text-[14px] text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
          {([
            ["Active", sum?.active, "bg-white border-gray-200 text-gray-800", "active"],
            ["Safe", sum?.safe, META.safe.card, "safe"],
            ["Near Expiry", sum?.near, META.near.card, "near"],
            ["Grace", sum?.grace, META.grace.card, "grace"],
            ["Over Due", sum?.overdue, META.overdue.card, "overdue"],
            ["Removed", sum?.removed, META.removed.card, null],
            ["Total", sum?.total, "bg-white border-gray-200 text-gray-800", "all"],
          ] as [string, number | undefined, string, StatusFilter | null][]).map(([label, n, cls, key]) => (
            <button key={label} disabled={!key} onClick={() => key && setStatus(key)}
              className={`rounded-2xl border p-4 text-left ${cls} ${key && status === key ? "ring-2 ring-blue-400" : ""}`}>
              <div className="text-[32px] font-bold leading-none">{n ?? "–"}</div>
              <div className="text-[13.5px] font-medium mt-2">{label}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, address, code…"
            className="flex-1 min-w-[220px] max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[15px] outline-none focus:border-blue-400" />
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setStatus(f.key)}
              className={`px-4 py-1.5 rounded-full text-[13.5px] border ${status === f.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-[14px] text-gray-500">{rows.length} shown</span>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16 text-[15px]">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center text-[15px] text-gray-400">No subscribers match the current filters.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {rows.map((s) => {
              const m = META[s.status];
              return (
                <div key={s.id} onClick={() => setEditId(s.id)} role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") setEditId(s.id); }}
                  className={`bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all ${m.row}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[17px] font-semibold text-gray-900 leading-snug">{s.name}</div>
                      <div className="text-[14px] text-gray-500">{s.phone || "—"} · Code {s.subCode}</div>
                      <div className="text-[14px] text-gray-600 mt-0.5">{s.address}</div>
                      {s.remark && <div className="text-[13px] text-blue-600 mt-1">📝 {s.remark}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block text-[12.5px] px-2.5 py-1 rounded-full border font-medium ${m.badge}`}>{m.label}</span>
                      <div className="text-[17px] font-bold text-gray-900 mt-2">{fmtMonth(s.expiryMonth)}</div>
                      <div className="text-[12px] text-gray-400">expiry</div>
                    </div>
                  </div>
                  <div className="text-right text-[13px] text-blue-600 font-medium mt-2">Edit →</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <EditPanel sub={editing} onClose={() => setEditId(null)}
          onSaved={async () => { setEditId(null); flash("Saved"); await load(); }}
          onAuthLost={onLogout} />
      )}
      {showPw && <PasswordModal onClose={() => setShowPw(false)} onDone={() => { setShowPw(false); flash("Password changed"); }} onAuthLost={onLogout} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-800 text-white text-[14px] px-5 py-2.5 rounded-full shadow-lg">{toast}</div>}
    </div>
  );
}

// ─── Full-screen edit ─────────────────────────────────────────────────────────

function EditPanel({ sub, onClose, onSaved, onAuthLost }: { sub: Sub; onClose: () => void; onSaved: () => void; onAuthLost: () => void }) {
  const [f, setF] = useState({
    phone: sub.phone, address: sub.address, startMonth: sub.startMonth, expiryMonth: sub.expiryMonth,
    years: sub.years == null ? "" : String(sub.years), remark: sub.remark,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const m = META[sub.status];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const save = async () => {
    if (!/^\d{4}-\d{2}$/.test(f.expiryMonth)) { setError("Pick the expiry month."); return; }
    setSaving(true); setError("");
    try {
      await call("/subscribers", { method: "POST", body: JSON.stringify({ id: sub.id, ...f }) });
      onSaved();
    } catch (e: unknown) {
      if (e instanceof AuthError) { onAuthLost(); return; }
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-wrap">
        <button onClick={onClose} className="px-3 py-2 border border-gray-200 rounded-lg text-[14px] text-gray-600 hover:bg-gray-50">← Back</button>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[22px] font-semibold text-gray-900 leading-tight">{sub.name}</span>
            <span className={`text-[13px] px-3 py-1 rounded-full border font-medium ${m.badge}`}>{m.label}</span>
          </div>
          <div className="text-[14px] text-gray-500">Code {sub.subCode}{sub.statusText ? ` · ${sub.statusText}` : ""}</div>
        </div>
        <button onClick={onClose} aria-label="Close" className="px-3 py-2 text-gray-400 hover:text-gray-700 text-[20px] leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Subscription status</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Expiry month (last issue) *</label>
                <input type="month" className={inp} value={f.expiryMonth} onChange={(e) => setF({ ...f, expiryMonth: e.target.value })} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Start month</label>
                <input type="month" className={inp} value={f.startMonth} onChange={(e) => setF({ ...f, startMonth: e.target.value })} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[13px] text-gray-500 mb-1.5">Quick renew (from the later of today or current expiry)</div>
              <div className="flex gap-2 flex-wrap">
                {[3, 6, 12, 24].map((n) => (
                  <button key={n} type="button" onClick={() => setF({ ...f, expiryMonth: renewFrom(sub.expiryMonth, n) })}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 text-[13.5px] font-medium hover:bg-blue-100">
                    +{n} months → {fmtMonth(renewFrom(sub.expiryMonth, n))}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 max-w-[160px]">
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Years</label>
              <input className={inp} value={f.years} onChange={(e) => setF({ ...f, years: e.target.value.replace(/\D/g, "") })} placeholder="optional" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <div className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Contact &amp; delivery</div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone</label>
              <input className={inp} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Delivery address</label>
              <input className={inp} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Remark</label>
              <input className={inp} value={f.remark} maxLength={255} onChange={(e) => setF({ ...f, remark: e.target.value })} placeholder="e.g. will renew next month" />
            </div>
          </div>

          {error && <p className="text-[14px] text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-[15px] font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving…" : "Update"}
            </button>
            <button onClick={onClose} disabled={saving} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-lg text-[15px] hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change password ──────────────────────────────────────────────────────────

function PasswordModal({ onClose, onDone, onAuthLost }: { onClose: () => void; onDone: () => void; onAuthLost: () => void }) {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setError("");
    try {
      await call("/password", { method: "POST", body: JSON.stringify({ oldPassword, newPassword }) });
      onDone();
    } catch (e: unknown) {
      if (e instanceof AuthError) { onAuthLost(); return; }
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-3">
        <div className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Change password</div>
        <input className={inp} type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOld(e.target.value)} />
        <input className={inp} type="password" placeholder="New password (min 6)" value={newPassword} onChange={(e) => setNew(e.target.value)} />
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button onClick={submit} disabled={busy} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-[14px] hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
