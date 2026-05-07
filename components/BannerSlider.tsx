"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSlides } from "@/lib/api";

export default function BannerSlider() {
  const [slides, setSlides] = useState<{ id: string; image: string; title: string }[]>([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    getSlides().then((loaded) => {
      if (loaded.length > 0) setSlides(loaded.map((s) => ({ id: s.id, image: s.image, title: s.title })));
    });
  }, []);

  const goTo = (index: number) => setCurrent((index + slides.length) % slides.length);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
  };

  useEffect(() => {
    if (slides.length < 2) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); resetTimer(); }
    touchStartX.current = null;
  };

  if (slides.length === 0) return null;

  return (
    <div className="mx-5 mb-4">
      <div
        className="relative w-full h-[180px] rounded-2xl overflow-hidden cursor-pointer"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => router.push(`/slide?id=${slides[current].id}`)}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            {s.image ? (
              <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-[13px]">{s.title}</div>
            )}
          </div>
        ))}

      </div>

      {/* Dots below image */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); resetTimer(); }}
              aria-label={`Slide ${i + 1}`}
            >
              <span className={`block rounded-full transition-all duration-300 ${
                i === current ? "w-4 h-1.5 bg-[#B08A3A]" : "w-1.5 h-1.5 bg-gray-300"
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
