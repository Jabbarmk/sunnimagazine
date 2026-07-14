"use client";

import { useState, useEffect } from "react";
import { getOtherMagazines, saveOtherMagazine, deleteOtherMagazine, uploadPdf } from "@/lib/api";
import type { OtherMagazine } from "@/lib/store";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";

const EMPTY = { title: "", details: "", cover: "", pdfUrl: "", issueDate: "", sortOrder: 0 };

export default function OtherMagazinesPage() {
  const [items, setItems] = useState<OtherMagazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);

  const reload = async () => {
    setLoading(true);
    try { setItems(await getOtherMagazines()); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const reset = () => { setForm(EMPTY); setEditId(null); setFe({}); setSaveError(""); };

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleEdit = (m: OtherMagazine) => {
    setEditId(m.id);
    setForm({
      title: m.title ?? "", details: m.details ?? "", cover: m.cover ?? "",
      pdfUrl: m.pdfUrl ?? "", issueDate: m.issueDate ?? "", sortOrder: m.sortOrder ?? 0,
    });
    setFe({}); setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setSaveError("");
    try {
      const url = await uploadPdf(file);
      setForm((f) => ({ ...f, pdfUrl: url }));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "PDF upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.pdfUrl) errs.pdfUrl = "Please upload a PDF";
    if (Object.keys(errs).length) { setFe(errs); return; }
    try {
      await saveOtherMagazine({
        id: editId ?? "om_" + Date.now(),
        title: form.title.trim(),
        details: form.details.trim(),
        cover: form.cover,
        pdfUrl: form.pdfUrl,
        issueDate: form.issueDate.trim(),
        sortOrder: form.sortOrder,
      });
      reset(); reload();
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this magazine?")) return;
    await deleteOtherMagazine(id); reload();
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">Other Magazines</h1>
        <p className="text-[13px] text-gray-500 mt-1">{loading ? "Loading…" : `${items.length} items`} · cover + details + PDF, shown on the app home</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {editId ? "Edit Magazine" : "Add Magazine"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Cover Image</label>
            <ImageUpload value={form.cover || null} onChange={(v) => setForm((f) => ({ ...f, cover: v }))} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={set("title")} placeholder="Magazine title" className={inp("title")} />
            {fe.title && <p className="text-[11px] text-red-500 mt-1">{fe.title}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Issue Date</label>
            <input value={form.issueDate} onChange={set("issueDate")} placeholder="e.g. January 2026" className={inp("issueDate")} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Details</label>
            <textarea value={form.details} onChange={set("details")} placeholder="Short description…" rows={3}
              className={`${inp("details")} resize-y`} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">PDF File <span className="text-red-400">*</span></label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <span className="inline-block px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50">
                  {uploading ? "Uploading…" : form.pdfUrl ? "Change PDF" : "Upload PDF"}
                </span>
                <input type="file" accept="application/pdf,.pdf" onChange={handlePdf} className="hidden" disabled={uploading} />
              </label>
              {form.pdfUrl && (
                <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-500 hover:text-blue-700 truncate">
                  {form.pdfUrl.split("/").pop()}
                </a>
              )}
            </div>
            {fe.pdfUrl && <p className="text-[11px] text-red-500 mt-1">{fe.pdfUrl}</p>}
            <p className="text-[11px] text-gray-400 mt-1">PDF up to 50 MB.</p>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Sort Order</label>
            <input type="number" min="0" value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
            <p className="text-[11px] text-gray-400 mt-1">Lower number = shown first.</p>
          </div>
          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
              {editId ? "Save Changes" : "Add Magazine"}
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
              No magazines yet. Add one above.
            </div>
          )}
          {items.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 p-3">
              {m.cover ? (
                <img src={m.cover} alt={m.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 text-[20px]">📕</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-800 truncate">{m.title}</div>
                {m.issueDate && <div className="text-[12px] text-amber-600 font-medium mt-0.5">{m.issueDate}</div>}
                {m.pdfUrl && (
                  <a href={m.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-500 hover:text-blue-700 mt-0.5 inline-block">📄 View PDF</a>
                )}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <RowActionButton onClick={() => handleEdit(m)}>Edit</RowActionButton>
                <RowActionButton variant="danger" onClick={() => handleDelete(m.id)}>Delete</RowActionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
