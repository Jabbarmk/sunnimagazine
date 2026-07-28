"use client";

import { useState } from "react";

// Full detail view for a wing item: hero image, caption, description, and a
// grid of all images. Tapping any image opens a fullscreen viewer with close.
export default function WingItemGallery({ caption, description, images }: {
  caption: string; description: string; images: string[];
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="px-5 pt-2 pb-10 space-y-5">
      {images[0] && (
        <img
          src={images[0]}
          alt={caption}
          className="w-full rounded-2xl object-cover cursor-pointer"
          onClick={() => setActive(0)}
        />
      )}

      <h1 className="font-serif text-[20px] text-ink leading-snug">{caption}</h1>

      {description && (
        <p className="text-[15px] text-[#2a2a2d] leading-[1.8] whitespace-pre-line">{description}</p>
      )}

      {images.length > 1 && (
        <div>
          <div className="text-[11px] tracking-[0.15em] uppercase text-gold font-semibold mb-2">
            Gallery — {images.length} photos
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-full h-24 object-cover rounded-xl cursor-pointer"
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        </div>
      )}

      {active !== null && images[active] && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
          <div className="flex items-center justify-end px-4 py-3 flex-shrink-0">
            <button
              onClick={() => setActive(null)}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center text-[18px] hover:bg-white/25"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-4 overflow-hidden">
            <img src={images[active]} alt="" className="max-w-full max-h-full object-contain" />
          </div>
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 pb-6 flex-shrink-0">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <span className={`block rounded-full transition-all ${i === active ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
