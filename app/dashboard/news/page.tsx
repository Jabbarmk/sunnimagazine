"use client";

import { useState, useEffect } from "react";
import {
  getNews, saveNewsItem, deleteNewsItem,
  getNewsCategories, saveNewsCategory, deleteNewsCategory,
} from "@/lib/api";
import type { NewsItem, NewsCategory } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";

const today = () => new Date().toISOString().split("T")[0];

const EMPTY = { categoryId: "", title: "", description: "", image: "", source: "", publishedAt: today() };

function fmtDate(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [cats, setCats] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const [newsData, catData] = await Promise.all([getNews(), getNewsCategories()]);
      setItems(newsData);
      setCats(catData);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, []);

  const reset = () => { setForm({ ...EMPTY, publishedAt: today() }); setEditId(null); setFe({}); setSaveError(""); };

  const set = (k: keyof typeof EMPTY) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleEdit = (item: NewsItem) => {
    setEditId(item.id);
    setForm({
      categoryId: item.categoryId,
      title: item.title,
      description: item.description,
      image: item.image,
      source: item.source,
      publishedAt: item.publishedAt || today(),
    });
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (Object.keys(errors).length) { setFe(errors); return; }
    try {
      const selCat = cats.find((c) => c.id === form.categoryId);
      const id = editId ?? "news_" + Date.now();
      await saveNewsItem({
        id,
        categoryId: form.categoryId,
        categoryName: selCat?.name ?? "",
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image,
        source: form.source.trim(),
        publishedAt: form.publishedAt,
      });
      reset(); reload();
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this news item?")) return;
    await deleteNewsItem(id); reload();
  };

  const handleAddCat = async () => {
    const name = newCatName.trim();
    if (!name) { setCatError("Name is required"); return; }
    const dup = cats.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (dup) { setCatError("Category already exists"); return; }
    await saveNewsCategory({ id: "ncat_" + Date.now(), name });
    setNewCatName(""); setCatError(""); reload();
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteNewsCategory(id); reload();
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">News &amp; Blogs</h1>
        <p className="text-[13px] text-gray-500 mt-1">{loading ? "Loading…" : `${items.length} items`}</p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">News Categories</div>
        <div className="flex gap-2 mb-2">
          <input
            value={newCatName}
            onChange={(e) => { setNewCatName(e.target.value); setCatError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAddCat()}
            placeholder="New category name"
            className={`flex-1 px-3 py-2 border rounded-lg text-[13px] outline-none focus:border-blue-400 ${catError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          />
          <button onClick={handleAddCat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
            Add
          </button>
        </div>
        {catError && <p className="text-[11px] text-red-500 mb-2">{catError}</p>}
        {cats.length === 0 ? (
          <p className="text-[12px] text-gray-400">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-[12px] text-gray-700">{c.name}</span>
                <button onClick={() => handleDeleteCat(c.id)} className="text-gray-400 hover:text-red-500 text-[11px]">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit News Item" : "Add News Item"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category</label>
            <select value={form.categoryId} onChange={set("categoryId")} className={inp("categoryId")}>
              <option value="">Select category</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={set("title")} placeholder="News title" className={inp("title")} />
            {fe.title && <p className="text-[11px] text-red-500 mt-1">{fe.title}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set("description")} placeholder="News content…"
              rows={5} className={`${inp("description")} resize-y`} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Image</label>
            <ImageUpload value={form.image || null} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Source</label>
            <input value={form.source} onChange={set("source")} placeholder="e.g. Gulf News, Reuters…"
              className={inp("source")} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Published Date</label>
            <input
              type="date"
              value={form.publishedAt}
              onChange={set("publishedAt")}
              className={inp("publishedAt")}
            />
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700">
              {editId ? "Save Changes" : "Add News"}
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
              No news items yet. Add one above.
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 flex items-start gap-3 p-3">
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[22px]">📰</div>
              )}
              <div className="flex-1 min-w-0">
                {item.categoryName && (
                  <div className="text-[11px] text-amber-600 font-medium mb-0.5">{item.categoryName}</div>
                )}
                <div className="text-[13px] font-medium text-gray-800 line-clamp-2">{item.title}</div>
                {item.source && <div className="text-[11px] text-gray-400 mt-0.5">{item.source}</div>}
                {item.publishedAt && <div className="text-[11px] text-gray-400">{fmtDate(item.publishedAt)}</div>}
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => handleEdit(item)} className="text-[12px] text-gray-400 hover:text-gray-700">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-[12px] text-red-400 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
