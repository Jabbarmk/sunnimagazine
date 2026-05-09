"use client";

import { useState, useEffect } from "react";
import { getArtCategories, saveArtCategory, deleteArtCategory } from "@/lib/api";
import type { ArtCategory } from "@/lib/store";

export default function ArtCategoriesPage() {
  const [cats, setCats] = useState<ArtCategory[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const reload = () => { getArtCategories().then(setCats); };
  useEffect(reload, []);

  const reset = () => { setName(""); setEditId(null); setError(""); };

  const isDuplicate = (n: string, excludeId?: string) =>
    cats.some((c) => c.id !== excludeId && c.name.toLowerCase() === n.toLowerCase());

  const handleEdit = (c: ArtCategory) => { setEditId(c.id); setName(c.name); setError(""); };

  const handleSave = async () => {
    const n = name.trim();
    if (!n) { setError("Name is required."); return; }
    if (isDuplicate(n, editId ?? undefined)) { setError("This category already exists."); return; }
    await saveArtCategory({ id: editId ?? "ac_" + Date.now(), name: n });
    reset(); reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this art category?")) return;
    await deleteArtCategory(id); reload();
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Art Categories</h1>
        <p className="text-[13px] text-gray-500 mt-1">{cats.length} categories</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {editId ? "Edit Category" : "Add Category"}
        </div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Category name"
            className={`flex-1 px-3 py-2 border rounded-lg text-[13px] outline-none ${error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`}
          />
          <button onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
            {editId ? "Save" : "Add"}
          </button>
          {editId && (
            <button onClick={reset} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-[11px] text-red-500 mt-1.5">{error}</p>}
      </div>

      <div className="space-y-2">
        {cats.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400">
            No art categories yet. Add one above.
          </div>
        )}
        {cats.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 px-4 py-3">
            <div className="flex-1 text-[13px] font-medium text-gray-800 font-malayalam" lang="ml">{c.name}</div>
            <button onClick={() => handleEdit(c)} className="text-[12px] text-gray-400 hover:text-gray-700">Edit</button>
            <button onClick={() => handleDelete(c.id)} className="text-[12px] text-red-400 hover:text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
