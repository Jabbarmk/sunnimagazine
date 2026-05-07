"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSlide } from "@/lib/api";
import type { Slide } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft } from "@/components/Icons";

function SlideDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [slide, setSlide] = useState<Slide | null>(null);

  useEffect(() => {
    if (!id) return;
    getSlide(id).then((s) => setSlide(s ?? null));
  }, [id]);

  if (!slide) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          {slide.title && (
            <h1 className="font-serif text-[20px] text-ink leading-[1.2]">{slide.title}</h1>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-2 pb-10 space-y-6">

          {slide.poster && (
            <img src={slide.poster} alt="Poster" className="w-full rounded-2xl object-cover" />
          )}

          {slide.details && (
            <div>
              <p className="text-[15px] text-[#2a2a2d] leading-[1.8] font-body">{slide.details}</p>
            </div>
          )}

          {(slide.website || slide.contact) && (
            <div className="border-t border-line pt-5 space-y-4">
              {slide.website && (
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">Website</div>
                  <a
                    href={slide.website.startsWith("http") ? slide.website : `https://${slide.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-bg rounded-xl text-[13px] font-medium"
                  >
                    <span>🌐</span>
                    <span className="truncate max-w-[200px]">{slide.website}</span>
                  </a>
                </div>
              )}

              {slide.contact && (
                <div>
                  <div className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">Contact</div>
                  <div className="bg-surface rounded-xl border border-line p-4">
                    <p className="text-[14px] text-ink leading-[1.7] whitespace-pre-line">{slide.contact}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}

export default function SlidePage() {
  return (
    <Suspense fallback={
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Loading…</div>
        <BottomNav />
      </>
    }>
      <SlideDetail />
    </Suspense>
  );
}
