"use client";

import { useState, useEffect } from "react";
import { getAuthors, saveAuthor, deleteAuthor } from "@/lib/api";
import type { Author } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";

const EMPTY = { id: "", name: "", avatar: "" };

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const reload = () => { getAuthors().then(setAuthors); };
  useEffect(reload, []);

  const resetForm = () => { setForm(EMPTY); setEditId(null); setError(""); };

  const handleEdit = (a: Author) => {
    setEditId(a.id);
    setForm({ id: a.id, name: a.name, avatar: a.avatar });
    setError("");
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    const id = editId ?? "author_" + Date.now();
    await saveAuthor({ id, name: form.name.trim(), avatar: form.avatar });
    resetForm();
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this author?")) return;
    await deleteAuthor(id);
    reload();
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Authors</h1>
        <p className="text-[13px] text-gray-500 mt-1">{authors.length} authors</p>
      </div>

      {/* Add / Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Author" : "Add Author"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Author name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Avatar</label>
            <ImageUpload value={form.avatar} onChange={(v) => setForm((f) => ({ ...f, avatar: v }))} />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
            >
              {editId ? "Save Changes" : "Add Author"}
            </button>
            {editId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {authors.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">No authors yet</div>
        )}
        {authors.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3">
            {a.avatar ? (
              <img src={a.avatar} alt={a.name} className="w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[13px] flex-shrink-0">
                {a.name.charAt(0)}
              </div>
            )}
            <span className="flex-1 text-[13px] text-gray-800">{a.name}</span>
            <button
              onClick={() => handleEdit(a)}
              className="text-[12px] text-gray-400 hover:text-gray-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(a.id)}
              className="text-[12px] text-red-400 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
