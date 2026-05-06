"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Banner = {
  id: string;
  image: string;
  href?: string;
};

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = (index: number) => {
    setCurrent((index + banners.length) % banners.length);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 4000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(dx < 0 ? current + 1 : current - 1);
      resetTimer();
    }
    touchStartX.current = null;
  };

  const banner = banners[current];

  return (
    <div className="mx-5 mb-4">
      <div
        className="relative w-full h-[180px] rounded-2xl overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((b, i) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* dots */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetTimer(); }}
              className="transition-all duration-300"
              aria-label={`Go to banner ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
