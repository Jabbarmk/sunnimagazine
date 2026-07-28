"use client";

import { useState, useEffect } from "react";
import { getWingsCategories, saveWingsCategory, deleteWingsCategory, uploadWingImage } from "@/lib/api";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";

type WingsCategory = { id: string; name: string; image: string; sortOrder?: number; itemCount?: number };

const EMPTY = { name: "", image: "", sortOrder: 0 };

export default function WingsCategoriesPage() {
  const [items, setItems] = useState<WingsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);

  const reload = async () => {
    setLoading(true);
    try { setItems(await getWingsCategories()); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const reset = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); };

  const handleEdit = (c: WingsCategory) => {
    setEditId(c.id);
    setForm({ name: c.name ?? "", image: c.image ?? "", sortOrder: c.sortOrder ?? 0 });
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setSaveError("");
    try {
      const url = await uploadWingImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (Object.keys(errs).length) { setFe(errs); return; }
    try {
      await saveWingsCategory({
        id: editId ?? "wc_" + Date.now(),
        name: form.name.trim(),
        image: form.image,
        sortOrder: form.sortOrder,
      });
      reset(); reload();
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    await deleteWingsCategory(id); reload();
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">Wings</h1>
        <p className="text-[13px] text-gray-500 mt-1">{items.length} categories · shown on the app home below Other Magazines</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Category" : "Add Category"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category Image</label>
            {form.image && (
              <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded-lg border border-gray-200 mb-2" />
            )}
            <label className="cursor-pointer inline-block">
              <span className="inline-block px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50">
                {uploading ? "Uploading…" : form.image ? "Change image" : "Upload image"}
              </span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" disabled={uploading} />
            </label>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFe((p) => { const n = { ...p }; delete n.name; return n; }); }}
              placeholder="e.g. Youth Wing" className={inp("name")} />
            {fe.name && <p className="text-[11px] text-red-500 mt-1">{fe.name}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Sort Order</label>
            <input type="number" min="0" value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
              {editId ? "Save Changes" : "Add Category"}
            </button>
            {editId && (
              <button onClick={reset}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <SkeletonRows count={3} hasImage />
      ) : (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400">
              No categories yet. Add one above.
            </div>
          )}
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 p-3">
              {c.image ? (
                <img src={c.image} alt={c.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[22px]">🪶</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-800 truncate">{c.name}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">{c.itemCount ?? 0} item{c.itemCount === 1 ? "" : "s"}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <RowActionButton variant="primary" href={`/dashboard/wingscategories/items?category=${c.id}`}>
                  Manage Items
                </RowActionButton>
                <RowActionButton onClick={() => handleEdit(c)}>Edit</RowActionButton>
                <RowActionButton variant="danger" onClick={() => handleDelete(c.id)}>Delete</RowActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
