"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import ImgWithFallback from "@/components/ImgWithFallback";

type OtherMag = {
  id: string; title: string; details: string;
  cover: string; pdfUrl: string; issueDate: string;
};

// Home-page "Other Magazines": horizontal row of covers; tap opens the PDF
// in a fullscreen in-app viewer with a close button.
export default function OtherMagazines({ items }: { items: OtherMag[] }) {
  const [active, setActive] = useState<OtherMag | null>(null);
  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="mt-6 mb-4">
        <SectionHeader title="Other Magazines" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className="flex-shrink-0 w-[130px] text-left"
            >
              <div className="rounded-2xl overflow-hidden bg-surface shadow-card">
                <ImgWithFallback
                  src={m.cover}
                  alt={m.title}
                  className="w-full h-[180px] object-cover block"
                  fallback={<div className="w-full h-[180px] bg-gold/10 flex items-center justify-center text-[36px]">📕</div>}
                />
                <div className="p-2.5">
                  <div className="font-serif text-[12px] text-ink leading-snug line-clamp-2">{m.title}</div>
                  {m.issueDate && <div className="text-[10px] text-muted mt-0.5">{m.issueDate}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen PDF viewer */}
      {active && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
            <div className="text-white text-[14px] font-medium truncate pr-3">
              {active.title}{active.issueDate ? ` · ${active.issueDate}` : ""}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={active.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 text-[12px] underline underline-offset-2"
              >
                Open
              </a>
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center text-[18px] hover:bg-white/25"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white overflow-hidden">
            <iframe
              src={active.pdfUrl}
              title={active.title}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
