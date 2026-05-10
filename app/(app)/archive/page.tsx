"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { getMagazines } from "@/lib/api";
import type { Magazine } from "@/lib/data";
import { BackBar } from "@/components/TopBar";
import { SmallCover } from "@/components/MagazineCover";
import BottomNav from "@/components/BottomNav";

export default function ArchivePage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [year, setYear] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const MONTHS: Record<string, number> = {
      january:1,february:2,march:3,april:4,may:5,june:6,
      july:7,august:8,september:9,october:10,november:11,december:12,
    };
    getMagazines()
      .then((data) => {
        const all = [...data].sort((a, b) => {
          const yearDiff = Number(b.year) - Number(a.year);
          if (yearDiff !== 0) return yearDiff;
          return (MONTHS[b.month.toLowerCase()] ?? 0) - (MONTHS[a.month.toLowerCase()] ?? 0);
        });
        setMagazines(all);
        const years = Array.from(new Set(all.map((m) => m.year)));
        if (years.length) setYear(years[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(magazines.map((m) => m.year))).sort((a, b) => Number(b) - Number(a));
  const items = magazines.filter((m) => m.year === year);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0">
        <BackBar title="The Magazine" subtitle="Every issue, in one place" />

        {loading && (
          <>
            <div className="flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-14 rounded-full skeleton-shimmer flex-shrink-0" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[180px] rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          </>
        )}
        <div className={`flex gap-2 px-5 mb-4 overflow-x-auto no-scrollbar ${loading ? "hidden" : ""}`}>
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

        <div className={`grid grid-cols-2 gap-3 px-5 pb-4 ${loading ? "hidden" : ""}`}>
          {items.map((m, i) => (
            <SmallCover key={m.id} magazine={m} showLatest={i === 0 && year === years[0]} />
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
