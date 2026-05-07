"use client";

import { useState, useEffect } from "react";
import {
  getArts, saveArt, deleteArt,
  getMagazines, getArtCategories, getAuthors,
} from "@/lib/api";
import type { Art } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";

const EMPTY = {
  magazineId: "", artCategoryId: "", authorId: "",
  title: "", image: "", description: "",
};

export default function ArtPage() {
  const [arts, setArts] = useState<Art[]>([]);
  const [magazines, setMagazines] = useState<any[]>([]);
  const [artCats, setArtCats] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  const reload = () => {
    getArts().then(setArts);
    getMagazines().then(setMagazines);
    getArtCategories().then(setArtCats);
    getAuthors().then(setAuthors);
  };
  useEffect(reload, []);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); };

  const handleEdit = (a: Art) => {
    setEditId(a.id);
    setForm({ magazineId: a.magazineId, artCategoryId: a.artCategoryId, authorId: a.authorId, title: a.title, image: a.image, description: a.description });
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!form.magazineId) errors.magazineId = "Magazine is required";
    if (!form.artCategoryId) errors.artCategoryId = "Category is required";
    if (!form.title.trim()) errors.title = "Title is required";
    if (Object.keys(errors).length) { setFe(errors); return; }

    const selCat = artCats.find((c) => c.id === form.artCategoryId);
    const selAuthor = authors.find((a) => a.id === form.authorId);

    try {
      const id = editId ?? "art_" + Date.now();
      await saveArt({
        id,
        magazineId: form.magazineId,
        artCategoryId: form.artCategoryId,
        artCategoryName: selCat?.name ?? "",
        authorId: form.authorId,
        authorName: selAuthor?.name ?? "",
        authorAvatar: selAuthor?.avatar ?? "",
        title: form.title.trim(),
        image: form.image,
        description: form.description,
      });
      resetForm();
      reload();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this art item?")) return;
    await deleteArt(id);
    reload();
  };

  const inp = (extra: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none ${extra}`;
  const fieldCls = (k: string) =>
    inp(fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Art</h1>
        <p className="text-[13px] text-gray-500 mt-1">{arts.length} items</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Art Item" : "Add Art Item"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Magazine <span className="text-red-400">*</span></label>
            <select value={form.magazineId} onChange={set("magazineId")} className={fieldCls("magazineId")}>
              <option value="">Select magazine</option>
              {magazines.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            {fe.magazineId && <p className="text-[11px] text-red-500 mt-1">{fe.magazineId}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Art Category <span className="text-red-400">*</span></label>
            <select value={form.artCategoryId} onChange={set("artCategoryId")} className={fieldCls("artCategoryId")}>
              <option value="">Select category</option>
              {artCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {fe.artCategoryId && <p className="text-[11px] text-red-500 mt-1">{fe.artCategoryId}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Author</label>
            <select value={form.authorId} onChange={set("authorId")} className={fieldCls("authorId")}>
              <option value="">Select author (optional)</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={set("title")} placeholder="Art title"
              className={fieldCls("title")} />
            {fe.title && <p className="text-[11px] text-red-500 mt-1">{fe.title}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Image</label>
            <ImageUpload value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Optional description..." rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y" />
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
              {editId ? "Save Changes" : "Add Art"}
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

      <div className="space-y-3">
        {arts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400">
            No art items yet. Add one above.
          </div>
        )}
        {arts.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 flex items-start gap-3 p-3">
            {a.image ? (
              <img src={a.image} alt={a.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[20px]">⬜</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-amber-600 font-medium mb-0.5">{a.artCategoryName}</div>
              <div className="text-[13px] font-semibold text-gray-800 truncate font-malayalam" lang="ml">{a.title}</div>
              {a.description && <div className="text-[11px] text-gray-500 mt-0.5 whitespace-pre-wrap break-words" lang="ml">{a.description}</div>}
              {a.authorName && <div className="text-[11px] text-gray-400 mt-0.5">{a.authorName}</div>}
            </div>
            <button onClick={() => handleEdit(a)} className="text-[12px] text-gray-400 hover:text-gray-700 flex-shrink-0">Edit</button>
            <button onClick={() => handleDelete(a.id)} className="text-[12px] text-red-400 hover:text-red-600 flex-shrink-0">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
