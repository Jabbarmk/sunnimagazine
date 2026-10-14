"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface Props {
  value: string | null;
  onChange: (val: string) => void;
  /** Opens a crop step after choosing a file (and enables "Crop" on uploaded images). */
  crop?: boolean;
}

const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Original", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
];

// Longest side kept at 1600px (never upscaled) and WebP at quality 0.82 —
// visually lossless for photos at a fraction of the JPEG/PNG size.
const MAX_SIDE = 1600;
const WEBP_QUALITY = 0.82;

function compressImage(dataUrl: string, area?: Area | null): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const sx = area ? area.x : 0;
      const sy = area ? area.y : 0;
      const sw = area ? area.width : img.width;
      const sh = area ? area.height : img.height;
      let width = sw, height = sh;
      const longest = Math.max(width, height);
      if (longest > MAX_SIDE) {
        const scale = MAX_SIDE / longest;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      const webp = canvas.toDataURL("image/webp", WEBP_QUALITY);
      // Browsers without WebP encoding silently return PNG; fall back to JPEG then.
      resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function ImageUpload({ value, onChange, crop = false }: Props) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | null>(null);
  const [natural, setNatural] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const src = reader.result as string;
      if (crop) openCropper(src);
      else onChange(await compressImage(src));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openCropper = (src: string) => {
    setPos({ x: 0, y: 0 }); setZoom(1); setAspect(null); setArea(null);
    const probe = new Image();
    probe.onload = () => { setNatural(probe.width / probe.height); setCropSrc(src); };
    probe.src = src;
  };

  const onCropComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  const applyCrop = async () => {
    if (!cropSrc) return;
    setBusy(true);
    try { onChange(await compressImage(cropSrc, area)); }
    finally { setBusy(false); setCropSrc(null); }
  };

  const skipCrop = async () => {
    if (!cropSrc) return;
    setBusy(true);
    try { onChange(await compressImage(cropSrc)); }
    finally { setBusy(false); setCropSrc(null); }
  };

  const isUploaded = value?.startsWith("data:") ?? false;

  return (
    <div className="space-y-2">
      {cropSrc && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-4 space-y-3">
            <div className="text-[13px] font-semibold text-gray-800">Crop image</div>
            <div className="relative w-full h-[360px] bg-gray-900 rounded-lg overflow-hidden">
              <Cropper
                image={cropSrc}
                crop={pos}
                zoom={zoom}
                aspect={aspect ?? natural}
                onCropChange={setPos}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ASPECTS.map((a) => (
                <button key={a.label} type="button" onClick={() => setAspect(a.value)}
                  className={`px-2.5 py-1 rounded-full text-[12px] border ${aspect === a.value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                  {a.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-gray-500">Zoom</span>
              <input type="range" min={1} max={4} step={0.05} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setCropSrc(null)} disabled={busy}
                className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={skipCrop} disabled={busy}
                className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">Use without crop</button>
              <button type="button" onClick={applyCrop} disabled={busy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
                {busy ? "Saving…" : "Crop & Use"}
              </button>
            </div>
          </div>
        </div>
      )}
      {value && (
        <div className="relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded hover:bg-black/80"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <span className="inline-block px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            {value ? "Change image" : "Upload image"}
          </span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {crop && isUploaded && (
          <button type="button" onClick={() => openCropper(value!)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            Crop
          </button>
        )}
        {!isUploaded && <span className="text-[12px] text-gray-400">or paste a URL</span>}
      </div>
      {!isUploaded && (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
        />
      )}
    </div>
  );
}
