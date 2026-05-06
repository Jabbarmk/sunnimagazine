"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { magazines } from "@/lib/data";
import { LogoBar } from "@/components/TopBar";
import { SmallCover } from "@/components/MagazineCover";
import BottomNav from "@/components/BottomNav";

export default function ArchivePage() {
  const years = useMemo(() => {
    const unique = Array.from(new Set(magazines.map((m) => m.year)));
    return unique.sort((a, b) => Number(b) - Number(a));
  }, []);
  const [year, setYear] = useState<string>(years[0] ?? "2025");
  const items = magazines.filter((m) => m.year === year);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <LogoBar />
        <div className="px-5 mt-4 mb-3">
          <h1 className="font-serif text-[26px] text-ink leading-none">The Magazine</h1>
          <p className="text-[12px] text-muted mt-1.5">Every issue, in one place</p>
        </div>

        <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-[12px] border transition-colors",
                year === y
                  ? "bg-ink text-bg border-ink"
                  : "bg-surface text-muted border-line"
              )}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-4">
          {items.map((m, i) => (
            <SmallCover key={m.id} magazine={m} showLatest={i === 0 && year === years[0]} />
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
