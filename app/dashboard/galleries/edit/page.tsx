"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getArticle, getGallery, saveGalleryImage, deleteGalleryImage } from "@/lib/api";
import type { GalleryImage } from "@/lib/store";

function GalleryEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId") ?? "";
  const [articleTitle, setArticleTitle] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);

  const [saveError, setSaveError] = useState("");
  const [originalImages, setOriginalImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (!articleId) return;
    getArticle(articleId).then((a) => { if (a) setArticleTitle(a.title); });
    getGallery(articleId).then((imgs) => { setOriginalImages(imgs); setImages(imgs); });
  }, [articleId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, { id: "img_" + Date.now() + Math.random(), url: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSave = async () => {
    try {
      const originalIds = new Set(originalImages.map((img) => img.id));
      const currentIds = new Set(images.map((img) => img.id));
      // Delete removed images
      for (const img of originalImages) {
        if (!currentIds.has(img.id)) await deleteGalleryImage(img.id);
      }
      // Add new images
      for (const img of images) {
        if (!originalIds.has(img.id)) await saveGalleryImage({ ...img, articleId });
      }
      router.push("/dashboard/galleries");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save. Try removing some images.");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Edit Gallery</h1>
          {articleTitle && <p className="text-[12px] text-gray-500 mt-0.5 font-malayalam" lang="ml">{articleTitle}</p>}
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Add Images</div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="px-4 py-2 border border-dashed border-gray-300 rounded-lg text-[13px] text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
            + Choose images
          </span>
          <span className="text-[12px] text-gray-400">Select one or multiple</span>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {images.map((img, i) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden bg-gray-100">
              <img src={img.url} alt="" className="w-full aspect-square object-cover block" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.id)}
                  className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-[16px]"
                >
                  ×
                </button>
              </div>
              <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-8 text-center text-[13px] text-gray-400 mb-4">
          No images yet. Upload some above.
        </div>
      )}

      {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{saveError}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
        >
          Save Gallery
        </button>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function GalleryEditPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-[13px]">Loading…</div>}>
      <GalleryEdit />
    </Suspense>
  );
}
