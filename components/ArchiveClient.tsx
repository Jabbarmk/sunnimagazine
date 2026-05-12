"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Magazine } from "@/lib/data";
import { SmallCover } from "@/components/MagazineCover";

const MONTHS: Record<string, number> = {
  january:1,february:2,march:3,april:4,may:5,june:6,
  july:7,august:8,september:9,october:10,november:11,december:12,
};

export default function ArchiveClient({ magazines }: { magazines: Magazine[] }) {
  const sorted = [...magazines].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year);
    if (yearDiff !== 0) return yearDiff;
    return (MONTHS[b.month.toLowerCase()] ?? 0) - (MONTHS[a.month.toLowerCase()] ?? 0);
  });

  const years = Array.from(new Set(sorted.map((m) => m.year))).sort((a, b) => Number(b) - Number(a));
  const [year, setYear] = useState(years[0] ?? "");
  const items = sorted.filter((m) => m.year === year);

  return (
    <>
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
    </>
  );
}
