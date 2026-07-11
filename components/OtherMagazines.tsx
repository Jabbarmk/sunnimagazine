"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import ImgWithFallback from "@/components/ImgWithFallback";

type OtherMag = {
  id: string; title: string; details: string;
  cover: string; pdfUrl: string; issueDate: string;
};

// "Other Magazines" — tap a cover to open its PDF in a fullscreen in-app viewer.
// variant "row"  = home horizontal strip (optionally with a View All link)
// variant "grid" = full listing page (2-column grid)
export default function OtherMagazines({
  items,
  variant = "row",
  href,
  showHeader = true,
}: {
  items: OtherMag[];
  variant?: "row" | "grid";
  href?: string;
  showHeader?: boolean;
}) {
  const [active, setActive] = useState<OtherMag | null>(null);
  if (!items || items.length === 0) {
    return variant === "grid"
      ? <p className="px-5 py-16 text-center text-[13px] text-muted">No magazines yet.</p>
      : null;
  }

  const Card = ({ m }: { m: OtherMag }) => (
    <button onClick={() => setActive(m)} className="text-left w-full">
      <div className="rounded-2xl overflow-hidden bg-surface shadow-card">
        <ImgWithFallback
          src={m.cover}
          alt={m.title}
          className={`w-full object-cover block ${variant === "grid" ? "h-[240px]" : "h-[180px]"}`}
          fallback={<div className={`w-full ${variant === "grid" ? "h-[240px]" : "h-[180px]"} bg-gold/10 flex items-center justify-center text-[36px]`}>📕</div>}
        />
        <div className="p-2.5">
          <div className="font-serif text-[12px] text-ink leading-snug line-clamp-2">{m.title}</div>
          {m.issueDate && <div className="text-[10px] text-muted mt-0.5">{m.issueDate}</div>}
        </div>
      </div>
    </button>
  );

  return (
    <>
      <div className={variant === "row" ? "mt-6 mb-4" : "mb-4"}>
        {showHeader && (
          <SectionHeader title="Other Magazines" href={href} actionLabel="View All" />
        )}
        {variant === "row" ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
            {items.map((m) => (
              <div key={m.id} className="flex-shrink-0 w-[130px]"><Card m={m} /></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-5">
            {items.map((m) => <Card key={m.id} m={m} />)}
          </div>
        )}
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
            <iframe src={active.pdfUrl} title={active.title} className="w-full h-full border-0" />
          </div>
        </div>
      )}
    </>
  );
}
