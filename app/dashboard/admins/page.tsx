"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdmins, saveAdmin, deleteAdmin } from "@/lib/api";
import { getDashboardAdmin, DashboardAdmin } from "@/lib/auth";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";

type Admin = { id: number; email: string; role: "super_admin" | "admin" };

const EMPTY = { id: 0, email: "", password: "", role: "admin" as "super_admin" | "admin" };

export default function AdminsPage() {
  const router = useRouter();
  const [me, setMe] = useState<DashboardAdmin | null>(null);
  const [checked, setChecked] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const current = getDashboardAdmin();
    setMe(current);
    setChecked(true);
    if (current?.role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [router]);

  const reload = () => { getAdmins().then(setAdmins); };
  useEffect(() => { if (me?.role === "super_admin") reload(); }, [me]);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setError(""); };

  const handleEdit = (a: Admin) => {
    setEditId(a.id);
    setForm({ id: a.id, email: a.email, password: "", role: a.role });
    setError("");
  };

  const handleSave = async () => {
    const email = form.email.trim();
    if (!email) { setError("Email is required."); return; }
    if (!editId && !form.password.trim()) { setError("Password is required for a new admin."); return; }
    setSaving(true);
    setError("");
    try {
      await saveAdmin({
        id: editId || undefined,
        email,
        password: form.password.trim() || undefined,
        role: form.role,
      });
      resetForm();
      reload();
    } catch (e: any) {
      setError(e.message || "Failed to save admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: Admin) => {
    if (!confirm(`Delete admin "${a.email}"?`)) return;
    try {
      await deleteAdmin(a.id, me?.id);
      reload();
    } catch (e: any) {
      alert(e.message || "Failed to delete admin.");
    }
  };

  if (!checked) return null;
  if (me?.role !== "super_admin") return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Admins</h1>
        <p className="text-[13px] text-gray-500 mt-1">{admins.length} admin accounts &middot; Super Admin only</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Admin" : "Add Admin"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setError(""); }}
              placeholder="name@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              Password {editId && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setError(""); }}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "super_admin" | "admin" }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {error && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Admin"}
            </button>
            {editId && (
              <button onClick={resetForm}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {admins.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">No admins yet</div>
        )}
        {admins.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[13px] flex-shrink-0">
              {a.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-gray-800 truncate">{a.email}</div>
              {a.role === "super_admin" && (
                <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B08A3A] bg-[#B08A3A]/10 px-1.5 py-0.5 rounded">
                  Super Admin
                </span>
              )}
            </div>
            <RowActionButton onClick={() => handleEdit(a)}>Edit</RowActionButton>
            <RowActionButton variant="danger" onClick={() => handleDelete(a)}>Delete</RowActionButton>
          </div>
        ))}
      </div>
    </div>
  );
}
