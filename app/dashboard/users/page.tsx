"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAppUsers, saveAppUser, softDeleteUser, toggleUserActive,
  getUserSubscriptions, saveUserSubscription, deleteUserSubscription,
  getEmailSettings,
} from "@/lib/api";
import type { AppUser, UserSubscription, EmailSettings } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";
import { sendSubscriptionReceipt } from "@/lib/email";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubStatus = "active" | "expiring" | "expired" | "none";
type FilterTab = "all" | SubStatus;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function subStatus(to: string): SubStatus {
  if (!to) return "none";
  const days = Math.ceil((new Date(to + "-01").getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "active";
}

function daysLeft(to: string): number {
  return Math.ceil((new Date(to + "-01").getTime() - Date.now()) / 86_400_000);
}

function fmtMonth(val: string): string {
  if (!val) return "";
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m] = val.split("-");
  const idx = parseInt(m) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${y}` : val;
}

function validateMobile(v: string): string | null {
  if (!v) return null;
  const c = v.replace(/[\s\-\(\)]/g, "");
  if (!/^(\+?971)\d{9}$/.test(c)) return "Must start with 971 (e.g. 971501234567)";
  return null;
}

function printReceipt(user: AppUser, sub: UserSubscription) {
  const w = window.open("", "_blank", "width=600,height=500");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt</title><style>
    body{font-family:Arial,sans-serif;max-width:480px;margin:40px auto;color:#333}
    h2{color:#B08A3A;text-align:center;margin:0 0 4px}
    .sub{text-align:center;color:#999;font-size:13px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse}
    td{padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
    td:last-child{text-align:right;font-weight:600}
    .amount{color:#B08A3A;font-size:16px;font-weight:700}
    .footer{text-align:center;color:#999;font-size:12px;margin-top:24px}
    @media print{button{display:none}}
  </style></head><body>
  <h2>Gulf Sathyadhara</h2>
  <div class="sub">Subscription Receipt</div>
  <table>
    <tr><td>Member</td><td>${user.name}</td></tr>
    <tr><td>Mobile</td><td>${user.mobile || "—"}</td></tr>
    <tr><td>Period</td><td>${fmtMonth(sub.fromMonth)} – ${fmtMonth(sub.toMonth)}</td></tr>
    <tr><td>Amount Paid</td><td class="amount">AED ${sub.amountAed}</td></tr>
    ${sub.paidDate ? `<tr><td>Payment Date</td><td>${sub.paidDate}</td></tr>` : ""}
  </table>
  <div class="footer">Thank you for supporting Gulf Sathyadhara</div>
  <br><button onclick="window.print()">🖨 Print</button>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

const STATUS_META: Record<SubStatus, { label: string; badge: string; row: string }> = {
  active:   { label: "Active",        badge: "bg-green-50 text-green-700 border-green-200",  row: "border-l-4 border-l-green-400" },
  expiring: { label: "Expiring Soon", badge: "bg-amber-50 text-amber-700 border-amber-200",  row: "border-l-4 border-l-amber-400 bg-amber-50/40" },
  expired:  { label: "Expired",       badge: "bg-red-50 text-red-600 border-red-200",        row: "border-l-4 border-l-red-400 bg-red-50/40" },
  none:     { label: "No Sub",        badge: "bg-gray-100 text-gray-500 border-gray-200",    row: "border-l-4 border-l-gray-200" },
};

// ─── MonthYearPicker (fixed: local state, no premature clear) ─────────────────

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function MonthYearPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [lYear, setLYear] = useState(value ? value.split("-")[0] : "");
  const [lMonth, setLMonth] = useState(value ? value.split("-")[1] : "");

  useEffect(() => {
    if (value) { const [y, m] = value.split("-"); setLYear(y || ""); setLMonth(m || ""); }
    else { setLYear(""); setLMonth(""); }
  }, [value]);

  const commit = (y: string, m: string) => {
    if (y && m) onChange(`${y}-${m}`);
  };

  return (
    <div className="flex gap-2">
      <select value={lMonth} onChange={(e) => { setLMonth(e.target.value); commit(lYear, e.target.value); }}
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400">
        <option value="">Month</option>
        {MONTH_NAMES.map((m, i) => {
          const v = String(i + 1).padStart(2, "0");
          return <option key={v} value={v}>{m}</option>;
        })}
      </select>
      <input value={lYear} onChange={(e) => { setLYear(e.target.value); commit(e.target.value, lMonth); }}
        type="number" placeholder="Year" min="2020" max="2040"
        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
    </div>
  );
}

// ─── Subscription Panel ───────────────────────────────────────────────────────

function SubscriptionPanel({ user, emailSettings, waTemplate }: {
  user: AppUser;
  emailSettings: EmailSettings | null;
  waTemplate: string;
}) {
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amountAed: "", fromMonth: "", toMonth: "", paidDate: new Date().toISOString().split("T")[0] });
  const [sending, setSending] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try { setSubs(await getUserSubscriptions(user.id)); }
    finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { reload(); }, [reload]);

  const handleAdd = async () => {
    if (!form.amountAed || !form.fromMonth || !form.toMonth) {
      setMsg("Amount, From and To are required"); return;
    }
    try {
      const sub: UserSubscription = {
        id: "sub_" + Date.now(),
        userId: user.id,
        amountAed: parseFloat(form.amountAed),
        fromMonth: form.fromMonth,
        toMonth: form.toMonth,
        paidDate: form.paidDate,
      };
      setSending("save");
      await saveUserSubscription(sub);
      setForm({ amountAed: "", fromMonth: "", toMonth: "", paidDate: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      setMsg("Subscription added");
      // Send email receipt
      if (emailSettings?.host && user.email) {
        try {
          await sendSubscriptionReceipt(emailSettings, user.name, user.email, sub);
          setMsg("Subscription added & receipt sent");
        } catch { setMsg("Subscription added (email failed)"); }
      }
      reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Failed to save");
    } finally { setSending(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscription record?")) return;
    await deleteUserSubscription(id);
    reload();
  };

  const buildWaMsg = (sub: UserSubscription) => {
    const template = waTemplate ||
      "Dear {name}, your Gulf Sathyadhara subscription expires {expiry}. Amount: AED {amount}. Please renew soon.";
    return template
      .replace("{name}", user.name)
      .replace("{expiry}", fmtMonth(sub.toMonth))
      .replace("{amount}", String(sub.amountAed));
  };

  const latestSub = subs[0];

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
      {/* WhatsApp button for expiring/expired */}
      {latestSub && (subStatus(user.subscriptionTo) === "expiring" || subStatus(user.subscriptionTo) === "expired") && user.mobile && (
        <a
          href={`https://wa.me/${user.mobile.replace(/\D/g, "")}?text=${encodeURIComponent(buildWaMsg(latestSub))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[12px] font-medium hover:bg-green-600 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Send WhatsApp Reminder
        </a>
      )}

      {/* Subscription history */}
      {loading ? (
        <div className="text-[12px] text-gray-400">Loading subscriptions…</div>
      ) : subs.length === 0 ? (
        <div className="text-[12px] text-gray-400">No subscription records yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-200">
                <th className="text-left pb-2 font-medium">Period</th>
                <th className="text-left pb-2 font-medium">Amount</th>
                <th className="text-left pb-2 font-medium">Paid</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-gray-700 font-medium">
                    {fmtMonth(s.fromMonth)} – {fmtMonth(s.toMonth)}
                  </td>
                  <td className="py-2 text-amber-700 font-semibold">AED {s.amountAed}</td>
                  <td className="py-2 text-gray-500">{s.paidDate || "—"}</td>
                  <td className="py-2">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => printReceipt(user, s)}
                        className="text-[11px] text-blue-500 hover:text-blue-700">Print</button>
                      <button onClick={() => handleDelete(s.id)}
                        className="text-[11px] text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {msg && (
        <p className={`text-[12px] font-medium ${msg.includes("failed") ? "text-red-500" : "text-green-600"}`}>{msg}</p>
      )}

      {/* Add subscription form */}
      {showForm ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">New Subscription</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Amount (AED) <span className="text-red-400">*</span></label>
              <input type="number" min="0" value={form.amountAed}
                onChange={(e) => { setForm((f) => ({ ...f, amountAed: e.target.value })); setMsg(""); }}
                placeholder="e.g. 100"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Paid Date</label>
              <input type="date" value={form.paidDate}
                onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">From <span className="text-red-400">*</span></label>
              <MonthYearPicker value={form.fromMonth} onChange={(v) => setForm((f) => ({ ...f, fromMonth: v }))} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">To <span className="text-red-400">*</span></label>
              <MonthYearPicker value={form.toMonth} onChange={(v) => setForm((f) => ({ ...f, toMonth: v }))} />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={handleAdd} disabled={!!sending}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-medium hover:bg-blue-700 disabled:opacity-50">
              {sending === "save" ? "Saving…" : "Save Subscription"}
            </button>
            <button onClick={() => { setShowForm(false); setMsg(""); }}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-[12px] hover:bg-gray-50">
              Cancel
            </button>
            {emailSettings?.host && user.email && (
              <span className="text-[11px] text-gray-400">Receipt will be emailed to {user.email}</span>
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => { setShowForm(true); setMsg(""); }}
          className="text-[12px] text-blue-500 hover:text-blue-700 font-medium">
          + Add Subscription
        </button>
      )}
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY: Omit<AppUser, "id" | "isActive" | "deletedAt"> = {
  name: "", email: "", password: "", mobile: "", location: "",
  photo: "", subscriptionFrom: "", subscriptionTo: "",
  referredBy: "", referralMobile: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [waTemplate, setWaTemplate] = useState("");

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string } | null>(null);

  const reload = async () => {
    setLoading(true);
    try { setUsers(await getAppUsers()); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    reload();
    getEmailSettings().then((s) => {
      setEmailSettings(s);
      setWaTemplate((s as any).whatsappTemplate || "");
    });
  }, []);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); setShowForm(false); };

  const handleEdit = (u: AppUser) => {
    setEditId(u.id);
    setForm({
      name: u.name, email: u.email, password: "", mobile: u.mobile,
      location: u.location, photo: u.photo,
      subscriptionFrom: u.subscriptionFrom, subscriptionTo: u.subscriptionTo,
      referredBy: u.referredBy ?? "", referralMobile: u.referralMobile ?? "",
    });
    setFe({}); setSaveError(""); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
      setFe((p) => { const n = { ...p }; delete n[k]; return n; });
    };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())  errs.name  = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!editId && !form.password.trim()) errs.password = "Password is required";
    const mobileErr = validateMobile(form.mobile);
    if (mobileErr) errs.mobile = mobileErr;
    const refMobileErr = validateMobile(form.referralMobile);
    if (refMobileErr) errs.referralMobile = refMobileErr;
    if (Object.keys(errs).length) { setFe(errs); return; }
    try {
      const id = editId ?? "usr_" + Date.now();
      const existing = editId ? users.find((u) => u.id === editId) : null;
      await saveAppUser({
        id, name: form.name.trim(), email: form.email.trim(),
        password: form.password.trim() || existing?.password || "",
        mobile: form.mobile.trim(), location: form.location.trim(),
        photo: form.photo, subscriptionFrom: form.subscriptionFrom,
        subscriptionTo: form.subscriptionTo,
        referredBy: form.referredBy.trim(), referralMobile: form.referralMobile.trim(),
      });
      resetForm(); reload();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  const handleToggleActive = async (u: AppUser) => {
    await toggleUserActive(u.id, !u.isActive);
    reload();
  };

  const handleDelete = async (u: AppUser) => {
    const st = subStatus(u.subscriptionTo);
    if (st === "active" || st === "expiring") {
      setActionMsg({ id: u.id, msg: `Cannot delete: subscription active until ${fmtMonth(u.subscriptionTo)}` });
      setTimeout(() => setActionMsg(null), 4000);
      return;
    }
    if (!confirm(`Delete ${u.name}? This will move them to Deleted Users history.`)) return;
    try {
      await softDeleteUser(u.id);
      reload();
    } catch (e: unknown) {
      setActionMsg({ id: u.id, msg: e instanceof Error ? e.message : "Delete failed" });
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  const counts = { active: 0, expiring: 0, expired: 0, none: 0 };
  users.forEach((u) => { counts[subStatus(u.subscriptionTo)]++; });
  const filtered = tab === "all" ? users : users.filter((u) => subStatus(u.subscriptionTo) === tab);

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Users</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{loading ? "Loading…" : `${users.length} members`}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/dashboard/deletedusers"
            className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-[12px] hover:bg-gray-50">
            Deleted Users
          </a>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
              + Add User
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {([
          ["all",      users.length,    "Total",         "bg-white border-gray-200 text-gray-700"],
          ["active",   counts.active,   "Active",        "bg-green-50 border-green-200 text-green-700"],
          ["expiring", counts.expiring, "Expiring Soon", "bg-amber-50 border-amber-200 text-amber-700"],
          ["expired",  counts.expired,  "Expired",       "bg-red-50 border-red-200 text-red-600"],
        ] as [FilterTab, number, string, string][]).map(([key, count, label, cls]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`rounded-xl border p-3 text-left transition-all ${cls} ${tab === key ? "ring-2 ring-blue-400" : ""}`}>
            <div className="text-[22px] font-semibold leading-none">{count}</div>
            <div className="text-[11px] mt-1">{label}</div>
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {editId ? "Edit User" : "Add User"}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Photo</label>
              {form.photo && (
                <div className="flex justify-center mb-3">
                  <img src={form.photo} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                </div>
              )}
              <ImageUpload value={form.photo} onChange={(v) => setForm((f) => ({ ...f, photo: v }))} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={set("name")} placeholder="Full name" className={inp("name")} />
              {fe.name && <p className="text-[11px] text-red-500 mt-1">{fe.name}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input value={form.email} onChange={set("email")} type="email" placeholder="user@email.com" className={inp("email")} />
              {fe.email && <p className="text-[11px] text-red-500 mt-1">{fe.email}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                Password {editId && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}
                {!editId && <span className="text-red-400">*</span>}
              </label>
              <input value={form.password} onChange={set("password")} type="password" placeholder="••••••••" className={inp("password")} />
              {fe.password && <p className="text-[11px] text-red-500 mt-1">{fe.password}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Mobile</label>
              <input value={form.mobile} onChange={set("mobile")} placeholder="971501234567" className={inp("mobile")} />
              {fe.mobile
                ? <p className="text-[11px] text-red-500 mt-1">{fe.mobile}</p>
                : <p className="text-[10px] text-gray-400 mt-1">e.g. 971501234567</p>
              }
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Location</label>
              <input value={form.location} onChange={set("location")} placeholder="City, Country" className={inp("location")} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Referred By</label>
              <input value={form.referredBy} onChange={set("referredBy")} placeholder="Referrer name" className={inp("referredBy")} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Referral Mobile No.</label>
              <input value={form.referralMobile} onChange={set("referralMobile")} placeholder="971501234567" className={inp("referralMobile")} />
              {fe.referralMobile
                ? <p className="text-[11px] text-red-500 mt-1">{fe.referralMobile}</p>
                : <p className="text-[10px] text-gray-400 mt-1">e.g. 971501234567</p>
              }
            </div>
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-4">{saveError}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
              {editId ? "Save Changes" : "Add User"}
            </button>
            <button onClick={resetForm}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {!loading && users.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["all", "active", "expiring", "expired", "none"] as FilterTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-full text-[12px] border transition-colors capitalize ${
                tab === t ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              {t === "all" ? `All (${users.length})` :
               t === "none" ? `No Sub (${counts.none})` :
               `${STATUS_META[t as SubStatus].label} (${counts[t as SubStatus]})`}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <SkeletonRows count={4} hasImage />
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-10 text-center text-[13px] text-gray-400">
              {users.length === 0 ? "No users yet. Add one above." : "No users in this category."}
            </div>
          )}
          {filtered.map((u) => {
            const st = subStatus(u.subscriptionTo);
            const meta = STATUS_META[st];
            const dl = u.subscriptionTo ? daysLeft(u.subscriptionTo) : null;
            const isExpanded = expandedId === u.id;
            return (
              <div key={u.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${meta.row}`}>
                <div className="flex items-center gap-3 p-3">
                  {u.photo ? (
                    <img src={u.photo} alt={u.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-gray-100" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 text-[15px] font-semibold border border-gray-200">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-gray-800">{u.name}</span>
                      {!u.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 font-medium">Inactive</span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>
                        {meta.label}
                      </span>
                      {dl !== null && st === "expiring" && <span className="text-[10px] text-amber-600 font-medium">{dl}d left</span>}
                      {dl !== null && st === "expired"  && <span className="text-[10px] text-red-500 font-medium">{Math.abs(dl)}d ago</span>}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">{u.email}</div>
                    <div className="flex gap-3 mt-0.5 flex-wrap">
                      {u.mobile && <span className="text-[11px] text-gray-400">{u.mobile}</span>}
                      {u.location && <span className="text-[11px] text-gray-400">{u.location}</span>}
                    </div>
                    {(u.subscriptionFrom || u.subscriptionTo) && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {u.subscriptionFrom && <>From: {fmtMonth(u.subscriptionFrom)}</>}
                        {u.subscriptionFrom && u.subscriptionTo && " · "}
                        {u.subscriptionTo && <>To: {fmtMonth(u.subscriptionTo)}</>}
                      </div>
                    )}
                    {(u.referredBy || u.referralMobile) && (
                      <div className="text-[10px] text-blue-500 mt-0.5">
                        {u.referredBy && <>Ref: {u.referredBy}</>}
                        {u.referredBy && u.referralMobile && " · "}
                        {u.referralMobile}
                      </div>
                    )}
                    {actionMsg?.id === u.id && (
                      <div className="text-[11px] text-red-500 mt-1 font-medium">{actionMsg.msg}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0 items-end">
                    <button onClick={() => setExpandedId(isExpanded ? null : u.id)}
                      className={`text-[11px] px-2 py-1 rounded-md transition-colors ${isExpanded ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}>
                      {isExpanded ? "▲ Close" : "▼ Subs"}
                    </button>
                    <button onClick={() => handleEdit(u)} className="text-[12px] text-gray-400 hover:text-gray-700">Edit</button>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`text-[11px] ${u.isActive ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"}`}>
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(u)} className="text-[12px] text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
                {isExpanded && (
                  <SubscriptionPanel user={u} emailSettings={emailSettings} waTemplate={waTemplate} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
