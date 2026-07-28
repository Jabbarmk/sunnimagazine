"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getWingsCategories, getWings, saveWing, deleteWing, uploadWingImage } from "@/lib/api";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";

type Wing = {
  id: string; categoryId: string; caption: string; description: string;
  images: string[]; sortOrder?: number;
};

const EMPTY = { caption: "", description: "", images: [] as string[], sortOrder: 0 };

function WingsItemsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get("category") ?? "";

  const [categoryName, setCategoryName] = useState("");
  const [items, setItems] = useState<Wing[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);

  const reload = async () => {
    if (!categoryId) return;
    setLoading(true);
    try { setItems(await getWings(categoryId)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!categoryId) { router.replace("/dashboard/wingscategories"); return; }
    getWingsCategories().then((cats) => {
      const c = cats.find((x: any) => x.id === categoryId);
      setCategoryName(c?.name ?? "");
    });
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const reset = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); };

  const handleEdit = (w: Wing) => {
    setEditId(w.id);
    setForm({ caption: w.caption ?? "", description: w.description ?? "", images: w.images ?? [], sortOrder: w.sortOrder ?? 0 });
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true); setSaveError("");
    try {
      const urls = await Promise.all(files.map((f) => uploadWingImage(f)));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.caption.trim()) errs.caption = "Caption is required";
    if (Object.keys(errs).length) { setFe(errs); return; }
    try {
      await saveWing({
        id: editId ?? undefined,
        categoryId,
        caption: form.caption.trim(),
        description: form.description.trim(),
        images: form.images,
        sortOrder: form.sortOrder,
      });
      reset(); reload();
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await deleteWing(id); reload();
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <a href="/dashboard/wingscategories" className="text-gray-400 hover:text-gray-600 text-[20px]">←</a>
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">{categoryName || "Wings"} — Items</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{items.length} items</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Item" : "Add Item"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Caption <span className="text-red-400">*</span></label>
            <input value={form.caption} onChange={(e) => { setForm((f) => ({ ...f, caption: e.target.value })); setFe((p) => { const n = { ...p }; delete n.caption; return n; }); }}
              placeholder="Short caption / title" className={inp("caption")} />
            {fe.caption && <p className="text-[11px] text-red-500 mt-1">{fe.caption}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Full description…" rows={4} className={inp("description") + " resize-y"} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              Images <span className="text-gray-400 font-normal">— multiple allowed</span>
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-full h-16 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white text-[11px] flex items-center justify-center hover:bg-red-500">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="cursor-pointer inline-block">
              <span className="inline-block px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50">
                {uploading ? "Uploading…" : "Add images"}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" disabled={uploading} />
            </label>
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
              {editId ? "Save Changes" : "Add Item"}
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
              No items yet. Add one above.
            </div>
          )}
          {items.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 p-3">
              {w.images?.[0] ? (
                <img src={w.images[0]} alt={w.caption} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[22px]">🖼️</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-800 truncate">{w.caption}</div>
                <div className="text-[12px] text-gray-400 mt-0.5 line-clamp-1">{w.description}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{w.images?.length ?? 0} image{w.images?.length === 1 ? "" : "s"}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <RowActionButton onClick={() => handleEdit(w)}>Edit</RowActionButton>
                <RowActionButton variant="danger" onClick={() => handleDelete(w.id)}>Delete</RowActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WingsItemsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-[13px]">Loading…</div>}>
      <WingsItemsInner />
    </Suspense>
  );
}
