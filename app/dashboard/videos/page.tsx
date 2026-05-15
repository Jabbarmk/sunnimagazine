"use client";

import { useState, useEffect, useRef } from "react";
import {
  getVideos, saveVideo, deleteVideo,
  getVideoCategories, saveVideoCategory, deleteVideoCategory,
} from "@/lib/api";
import type { Video, VideoCategory } from "@/lib/store";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";

function extractYouTubeId(link: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s?]+)/,
    /youtu\.be\/([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?/]+)/,
    /youtube\.com\/embed\/([^&\s?/]+)/,
  ];
  for (const p of patterns) {
    const m = link.match(p);
    if (m) return m[1];
  }
  return null;
}

function getThumb(link: string): string | null {
  const id = extractYouTubeId(link);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const EMPTY_VIDEO = { categoryId: "", caption: "", link: "" };

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [cats, setCats] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_VIDEO);
  const [editId, setEditId] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  const [videoType, setVideoType] = useState<"link" | "file">("link");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const [vids, catData] = await Promise.all([getVideos(), getVideoCategories()]);
      setVideos(vids); setCats(catData);
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const reset = () => {
    setForm(EMPTY_VIDEO); setEditId(null); setFe({}); setSaveError("");
    setVideoType("link"); setUploadError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const set = (k: keyof typeof EMPTY_VIDEO) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleEdit = (v: Video) => {
    setEditId(v.id);
    const isUploaded = v.link.startsWith("/uploads/");
    setVideoType(isUploaded ? "file" : "link");
    setForm({ categoryId: v.categoryId, caption: v.caption, link: v.link });
    setFe({}); setSaveError(""); setUploadError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File must be under 50MB"); return;
    }
    setUploadError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/videos/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, link: data.url }));
      setFe((p) => { const n = { ...p }; delete n.link; return n; });
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!form.categoryId) errors.categoryId = "Select a category";
    if (!form.link.trim()) errors.link = videoType === "file" ? "Upload a video file" : "Video link is required";
    if (Object.keys(errors).length) { setFe(errors); return; }
    try {
      const selCat = cats.find((c) => c.id === form.categoryId);
      const id = editId ?? "vid_" + Date.now();
      await saveVideo({ id, categoryId: form.categoryId, categoryName: selCat?.name ?? "", caption: form.caption.trim(), link: form.link.trim() });
      reset(); reload();
    } catch (e: unknown) { setSaveError(e instanceof Error ? e.message : "Failed to save."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await deleteVideo(id); reload();
  };

  const handleAddCat = async () => {
    const name = newCatName.trim();
    if (!name) { setCatError("Name is required"); return; }
    const dup = cats.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (dup) { setCatError("Category already exists"); return; }
    await saveVideoCategory({ id: "vcat_" + Date.now(), name });
    setNewCatName(""); setCatError(""); reload();
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteVideoCategory(id); reload();
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${fe[k] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900">Videos</h1>
        <p className="text-[13px] text-gray-500 mt-1">{videos.length} videos</p>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Video Categories</div>
        <div className="flex gap-2 mb-3">
          <input
            value={newCatName}
            onChange={(e) => { setNewCatName(e.target.value); setCatError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAddCat()}
            placeholder="New category name"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
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
          {editId ? "Edit Video" : "Add Video"}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Category <span className="text-red-400">*</span></label>
            <select value={form.categoryId} onChange={set("categoryId")} className={inp("categoryId")}>
              <option value="">Select category</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fe.categoryId && <p className="text-[11px] text-red-500 mt-1">{fe.categoryId}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Caption</label>
            <input value={form.caption} onChange={set("caption")} placeholder="Video caption or title"
              className={inp("caption")} />
          </div>

          {/* Video source type toggle */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-2">Video Source <span className="text-red-400">*</span></label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setVideoType("link"); setUploadError(""); setForm((f) => ({ ...f, link: "" })); }}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors ${videoType === "link" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
              >
                Video Link (YouTube / Any URL)
              </button>
              <button
                type="button"
                onClick={() => { setVideoType("file"); setUploadError(""); setForm((f) => ({ ...f, link: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium border transition-colors ${videoType === "file" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
              >
                Upload Video (max 50MB)
              </button>
            </div>

            {videoType === "link" ? (
              <div>
                <input
                  value={form.link}
                  onChange={set("link")}
                  placeholder="https://youtube.com/watch?v=... or any video URL"
                  className={inp("link")}
                />
                {fe.link && <p className="text-[11px] text-red-500 mt-1">{fe.link}</p>}
                {form.link && getThumb(form.link) && (
                  <img src={getThumb(form.link)!} alt="preview" className="mt-2 w-40 h-24 object-cover rounded-lg" />
                )}
                {form.link && !extractYouTubeId(form.link) && form.link.startsWith("http") && (
                  <p className="text-[11px] text-gray-400 mt-1">Non-YouTube URL — will use built-in video player</p>
                )}
              </div>
            ) : (
              <div>
                <label
                  className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${fe.link ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span className="text-[13px] text-blue-500">Uploading…</span>
                  ) : form.link ? (
                    <div className="text-center">
                      <div className="text-[22px] mb-1">✅</div>
                      <span className="text-[12px] text-green-600 font-medium">Uploaded</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{form.link.split("/").pop()}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-[28px] mb-1">🎬</div>
                      <span className="text-[13px] text-gray-500">Click to select video file</span>
                      <p className="text-[11px] text-gray-400 mt-0.5">MP4, MOV, WebM — max 50MB</p>
                    </div>
                  )}
                </label>
                {(fe.link || uploadError) && (
                  <p className="text-[11px] text-red-500 mt-1">{uploadError || fe.link}</p>
                )}
              </div>
            )}
          </div>

          {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
              {editId ? "Save Changes" : "Add Video"}
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
      {loading && <SkeletonRows count={3} hasImage />}
      {!loading && <div className="space-y-3">
        {videos.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400">
            No videos yet. Add one above.
          </div>
        )}
        {videos.map((v) => {
          const thumb = getThumb(v.link);
          return (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 p-3">
              {thumb ? (
                <img src={thumb} alt={v.caption} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-14 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-[22px]">▶</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-amber-600 font-medium mb-0.5">{v.categoryName}</div>
                <div className="text-[13px] font-medium text-gray-800 truncate">{v.caption || v.link}</div>
                {v.link.startsWith("/uploads/") && (
                  <div className="text-[10px] text-blue-400 mt-0.5">Uploaded file</div>
                )}
              </div>
              <button onClick={() => handleEdit(v)} className="text-[12px] text-gray-400 hover:text-gray-700 flex-shrink-0">Edit</button>
              <button onClick={() => handleDelete(v.id)} className="text-[12px] text-red-400 hover:text-red-600 flex-shrink-0">Delete</button>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
