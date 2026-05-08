"use client";

import { useState, useEffect } from "react";
import { getAppUsers, saveAppUser, deleteAppUser } from "@/lib/api";
import type { AppUser } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";

// ─── subscription helpers ────────────────────────────────────────────────────

type SubStatus = "active" | "expiring" | "expired" | "none";

function subStatus(to: string): SubStatus {
  if (!to) return "none";
  const days = Math.ceil((new Date(to).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "active";
}

function daysLeft(to: string): number {
  return Math.ceil((new Date(to).getTime() - Date.now()) / 86_400_000);
}

const STATUS_META: Record<SubStatus, { label: string; badge: string; row: string }> = {
  active:   { label: "Active",         badge: "bg-green-50 text-green-700 border-green-200",  row: "border-l-4 border-l-green-400" },
  expiring: { label: "Expiring Soon",  badge: "bg-amber-50 text-amber-700 border-amber-200",  row: "border-l-4 border-l-amber-400 bg-amber-50/40" },
  expired:  { label: "Expired",        badge: "bg-red-50 text-red-600 border-red-200",         row: "border-l-4 border-l-red-400 bg-red-50/40" },
  none:     { label: "No Subscription",badge: "bg-gray-100 text-gray-500 border-gray-200",    row: "border-l-4 border-l-gray-200" },
};

// ─── empty form ───────────────────────────────────────────────────────────────

const EMPTY: Omit<AppUser, "id"> = {
  name: "", email: "", password: "", mobile: "", location: "",
  photo: "", subscriptionFrom: "", subscriptionTo: "",
  referredBy: "", referralMobile: "",
};

type FilterTab = "all" | SubStatus;

// ─── page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [showForm, setShowForm] = useState(false);

  const reload = () => { getAppUsers().then(setUsers); };
  useEffect(reload, []);

  const resetForm = () => {
    setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); setShowForm(false);
  };

  const handleEdit = (u: AppUser) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: "", mobile: u.mobile,
              location: u.location, photo: u.photo,
              subscriptionFrom: u.subscriptionFrom, subscriptionTo: u.subscriptionTo,
              referredBy: u.referredBy ?? "", referralMobile: u.referralMobile ?? "" });
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await deleteAppUser(id); reload();
  };

  // stats
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
          <p className="text-[13px] text-gray-500 mt-0.5">{users.length} members</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
            + Add User
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {([
          ["all",      users.length,      "Total",         "bg-white border-gray-200 text-gray-700"],
          ["active",   counts.active,     "Active",        "bg-green-50 border-green-200 text-green-700"],
          ["expiring", counts.expiring,   "Expiring Soon", "bg-amber-50 border-amber-200 text-amber-700"],
          ["expired",  counts.expired,    "Expired",       "bg-red-50 border-red-200 text-red-600"],
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
            {/* Photo — full width */}
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Photo</label>
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
              <input value={form.mobile} onChange={set("mobile")} placeholder="+91 98765 43210" className={inp("mobile")} />
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Location</label>
              <input value={form.location} onChange={set("location")} placeholder="City, Country" className={inp("location")} />
            </div>

            {/* Subscription */}
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Subscription From</label>
              <input value={form.subscriptionFrom} onChange={set("subscriptionFrom")} type="date" className={inp("subscriptionFrom")} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Subscription To</label>
              <input value={form.subscriptionTo} onChange={set("subscriptionTo")} type="date" className={inp("subscriptionTo")} />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Referred By</label>
              <input value={form.referredBy} onChange={set("referredBy")} placeholder="Referrer name" className={inp("referredBy")} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Referral Mobile No.</label>
              <input value={form.referralMobile} onChange={set("referralMobile")} placeholder="+91 98765 43210" className={inp("referralMobile")} />
            </div>
          </div>

          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg mt-4">{saveError}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
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
      {users.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["all", "active", "expiring", "expired", "none"] as FilterTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-full text-[12px] border transition-colors capitalize ${
                tab === t ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}>
              {t === "all" ? `All (${users.length})` :
               t === "none" ? `No Sub (${counts.none})` :
               `${STATUS_META[t].label} (${counts[t]})`}
            </button>
          ))}
        </div>
      )}

      {/* List */}
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
          return (
            <div key={u.id}
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${meta.row}`}>
              <div className="flex items-center gap-3 p-3">
                {/* Avatar */}
                {u.photo ? (
                  <img src={u.photo} alt={u.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 text-[15px] font-semibold border border-gray-200">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-gray-800">{u.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${meta.badge}`}>
                      {meta.label}
                    </span>
                    {dl !== null && st === "expiring" && (
                      <span className="text-[10px] text-amber-600 font-medium">{dl}d left</span>
                    )}
                    {dl !== null && st === "expired" && (
                      <span className="text-[10px] text-red-500 font-medium">{Math.abs(dl)}d ago</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">{u.email}</div>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {u.mobile && <span className="text-[11px] text-gray-400">{u.mobile}</span>}
                    {u.location && <span className="text-[11px] text-gray-400">{u.location}</span>}
                  </div>
                  {(u.subscriptionFrom || u.subscriptionTo) && (
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {u.subscriptionFrom && <>From: {u.subscriptionFrom}</>}
                      {u.subscriptionFrom && u.subscriptionTo && " · "}
                      {u.subscriptionTo && <>To: {u.subscriptionTo}</>}
                    </div>
                  )}
                  {(u.referredBy || u.referralMobile) && (
                    <div className="text-[10px] text-blue-500 mt-0.5">
                      {u.referredBy && <>Ref: {u.referredBy}</>}
                      {u.referredBy && u.referralMobile && " · "}
                      {u.referralMobile && <>{u.referralMobile}</>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(u)}
                    className="text-[12px] text-gray-400 hover:text-gray-700 text-right">Edit</button>
                  <button onClick={() => handleDelete(u.id)}
                    className="text-[12px] text-red-400 hover:text-red-600 text-right">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
