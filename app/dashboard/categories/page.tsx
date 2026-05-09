"use client";

import { useState, useEffect } from "react";
import { getCategories, saveCategory, deleteCategory } from "@/lib/api";
import type { Category } from "@/lib/store";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  const reload = () => { getCategories().then(setCategories); };
  useEffect(reload, []);

  const isDuplicate = (name: string, excludeId?: string) =>
    categories.some((c) => c.id !== excludeId && c.name.toLowerCase() === name.toLowerCase());

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) { setAddError("Name is required."); return; }
    if (isDuplicate(name)) { setAddError("This category already exists."); return; }
    await saveCategory({ id: "cat_" + Date.now(), name });
    setNewName(""); setAddError(""); reload();
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim()) return;
    const name = editName.trim();
    if (isDuplicate(name, editId)) { setEditError("This category already exists."); return; }
    await saveCategory({ id: editId, name });
    setEditId(null); setEditError(""); reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteCategory(id); reload();
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Categories</h1>
        <p className="text-[13px] text-gray-500 mt-1">{categories.length} categories</p>
      </div>

      {/* Add */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Category</div>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setAddError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Category name"
            lang="ml"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam"
          />
          <button onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
            Add
          </button>
        </div>
        {addError && <p className="text-[11px] text-red-500 mt-1.5">{addError}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {categories.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">No categories yet</div>
        )}
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
            {editId === cat.id ? (
              <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                  <input
                    value={editName}
                    onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") setEditId(null); }}
                    autoFocus lang="ml"
                    className="flex-1 px-3 py-1.5 border border-blue-400 rounded-lg text-[14px] outline-none font-malayalam"
                  />
                  <button onClick={handleSaveEdit} className="text-[12px] text-blue-600 hover:text-blue-800 font-medium">Save</button>
                  <button onClick={() => { setEditId(null); setEditError(""); }} className="text-[12px] text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
                {editError && <p className="text-[11px] text-red-500">{editError}</p>}
              </div>
            ) : (
              <>
                <span className="flex-1 text-[14px] text-gray-800 font-malayalam" lang="ml">{cat.name}</span>
                <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditError(""); }}
                  className="text-[12px] text-gray-400 hover:text-gray-700">Edit</button>
                <button onClick={() => handleDelete(cat.id)}
                  className="text-[12px] text-red-400 hover:text-red-600">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
