"use client";

import { useState } from "react";
import clsx from "clsx";
import { videos } from "@/lib/data";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Play } from "@/components/Icons";

const TABS = ["All", "Interviews", "Behind the Scenes", "Shorts"] as const;
type Tab = typeof TABS[number];

export default function VideosPage() {
  const [tab, setTab] = useState<Tab>("All");
  const featured = videos.find((v) => v.featured)!;
  const filtered = videos.filter((v) => {
    if (v.featured) return false;
    if (tab === "All") return true;
    return v.category === tab;
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <LogoBar />
        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">Videos</h1>
          <p className="text-[12px] text-muted mt-1.5">Films, conversations, and short cuts</p>
        </div>

        <div className="flex gap-5 overflow-x-auto no-scrollbar px-5 pb-2 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "pb-3 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors",
                tab === t
                  ? "border-gold text-ink font-medium"
                  : "border-transparent text-muted"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-5 pt-5">
          <div className="relative rounded-card overflow-hidden shadow-card">
            <img src={featured.thumbnail} alt={featured.title} className="w-full h-[200px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gold text-white flex items-center justify-center shadow-float">
              <Play size={22} />
            </button>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="text-[9px] tracking-[0.22em] uppercase opacity-80">{featured.category}</div>
              <div className="font-serif text-[17px] mt-1 leading-snug">{featured.title}</div>
            </div>
            <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">
              {featured.duration}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 mt-5 pb-4">
          {filtered.map((v) => (
            <div key={v.id}>
              <div className="relative rounded-xl overflow-hidden shadow-card">
                <img src={v.thumbnail} alt={v.title} className="w-full h-[120px] object-cover" />
                <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-ink">
                  <Play size={15} />
                </button>
                <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
              </div>
              <div className="mt-2 px-0.5">
                <div className="text-[8px] tracking-[0.22em] text-gold uppercase">{v.category}</div>
                <div className="font-serif text-[13px] text-ink leading-snug mt-0.5 line-clamp-2">
                  {v.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
