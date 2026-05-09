"use client";

import { useState, useEffect } from "react";
import { getSlides, saveSlide, deleteSlide } from "@/lib/api";
import type { Slide } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";

const EMPTY: Omit<Slide, "id"> & { sortOrder: number } = {
  image: "", poster: "", title: "", details: "", website: "", contact: "", sortOrder: 0,
};

export default function SliderPage() {
  const [slides, setSlides] = useState<(Slide & { sortOrder?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  const reload = async () => {
    setLoading(true);
    try { setSlides(await getSlides()); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); };

  const handleEdit = (s: Slide & { sortOrder?: number }) => {
    setEditId(s.id);
    setForm({
      image: s.image, poster: s.poster ?? "", title: s.title,
      details: s.details, website: s.website, contact: s.contact,
      sortOrder: s.sortOrder ?? 0,
    } as any);
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    try {
      const id = editId ?? "slide_" + Date.now();
      await saveSlide({ id, ...form, title: form.title.trim(), sortOrder: form.sortOrder } as any);
      resetForm();
      reload();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await deleteSlide(id);
    reload();
  };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Home Slider</h1>
        <p className="text-[13px] text-gray-500 mt-1">{loading ? "Loading…" : `${slides.length} slides`}</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Slide" : "Add Slide"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Banner Image</label>
            <ImageUpload value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Poster Image</label>
            <ImageUpload value={form.poster} onChange={(v) => setForm((f) => ({ ...f, poster: v }))} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title</label>
            <input value={form.title} onChange={set("title")} placeholder="Slide title"
              className={`w-full px-3 py-2 border rounded-lg text-[13px] outline-none ${fe.title ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`} />
            {fe.title && <p className="text-[11px] text-red-500 mt-1">{fe.title}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Details</label>
            <textarea value={form.details} onChange={set("details")} placeholder="Description or details..." rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Company Website</label>
            <input value={form.website} onChange={set("website")} placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Contact Details</label>
            <textarea value={form.contact} onChange={set("contact")} placeholder="Phone, email, address..." rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
            />
            <p className="text-[11px] text-gray-400 mt-1">Lower number = shown first. Use 0, 1, 2…</p>
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
              {editId ? "Save Changes" : "Add Slide"}
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

      {/* List */}
      {loading ? (
        <SkeletonRows count={3} hasImage />
      ) : (
        <div className="space-y-3">
          {slides.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400">
              No slides yet. Add one above.
            </div>
          )}
          {slides.map((s, i) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 p-3">
              <div className="text-[11px] text-gray-400 w-5 text-center flex-shrink-0 font-mono">
                {s.sortOrder ?? i + 1}
              </div>
              {s.image ? (
                <img src={s.image} alt={s.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-16 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[20px]">⬜</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-800 truncate">{s.title}</div>
                {s.website && <div className="text-[11px] text-gray-400 truncate">{s.website}</div>}
              </div>
              <button onClick={() => handleEdit(s)} className="text-[12px] text-gray-400 hover:text-gray-700 flex-shrink-0">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="text-[12px] text-red-400 hover:text-red-600 flex-shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
