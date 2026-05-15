"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, ChevronLeft } from "@/components/Icons";
import ImgWithFallback from "@/components/ImgWithFallback";
import ArticleRow from "@/components/ArticleRow";
import BottomNav from "@/components/BottomNav";
import { getMagazine, getArticles, getEditorial } from "@/lib/api";
import type { Magazine, Article } from "@/lib/data";

export default function MagazineView({ id }: { id: string }) {
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [items, setItems] = useState<Article[]>([]);
  const [editorial, setEditorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMagazine(id)
      .then((m) => {
        if (!m) { setLoading(false); return; }
        setMagazine(m);
        return Promise.all([
          getArticles().then((all) => setItems(all.filter((a) => a.magazineId === m.id))),
          getEditorial(m.id).then(setEditorial),
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
          <div className="loading-bar w-full" />
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
            <div className="w-5 h-4 rounded skeleton-shimmer" />
            <div className="h-4 w-36 rounded skeleton-shimmer" />
          </div>
          <div className="w-full h-[260px] skeleton-shimmer" />
          <div className="px-5 pt-5 pb-2 space-y-2">
            <div className="h-3 w-14 rounded skeleton-shimmer" />
            <div className="h-6 w-52 rounded skeleton-shimmer" />
            <div className="h-3 w-full rounded skeleton-shimmer" />
            <div className="h-3 w-4/5 rounded skeleton-shimmer" />
          </div>
          <div className="mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 px-4 py-4 border-t border-line">
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded skeleton-shimmer" style={{ width: "70%" }} />
                  <div className="h-3 rounded skeleton-shimmer" style={{ width: "40%" }} />
                </div>
                <div className="w-14 h-10 rounded-lg skeleton-shimmer flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  if (!magazine) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Magazine not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <div className="relative mt-1">
          <ImgWithFallback src={magazine.cover} alt={magazine.title} className="w-full h-[100px] object-cover"
            fallback={<div className="w-full h-[100px] bg-surface flex items-center justify-center text-muted"><Book size={32} /></div>} />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
          <button
            onClick={() => window.history.back()}
            className="absolute top-3 left-4 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-card flex items-center justify-center text-ink"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <div className="px-5 pt-5 pb-2">
          <div className="text-[9px] tracking-[0.25em] text-gold uppercase">In this issue</div>
          <h1 className="font-malayalam font-bold text-[26px] text-ink mt-1 leading-[1.3]">{magazine.title}</h1>
          <p className="text-[13px] text-muted italic mt-2">{magazine.description}</p>
        </div>

        {/* Editorial strip */}
        {editorial && (
          <div className="mx-5 mb-2 px-4 py-3 rounded-xl bg-navy/5 border border-gold/20 flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B08A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              {editorial.gulfEditorInCharge && (
                <p className="text-[12px] font-semibold text-ink truncate">{editorial.gulfEditorInCharge}</p>
              )}
              <p className="text-[10px] tracking-[0.15em] text-gold uppercase">Editor in Charge</p>
            </div>
          </div>
        )}
        <div className="mt-2">
          {items.length === 0 && (
            <div className="px-5 py-10 text-center text-muted text-[13px]">
              This issue's articles are not yet available.
            </div>
          )}
          {items.map((a, i) => (
            <div key={a.id} className={i > 0 ? "border-t border-line" : ""}>
              <ArticleRow article={a} />
            </div>
          ))}
        </div>
        <div className="px-5 pt-4 pb-6 flex gap-3">
          <Link href={`/art?magazineId=${magazine.id}`} className="flex-1">
            <button className="w-full py-3.5 rounded-2xl bg-gold text-white font-semibold text-[15px] tracking-wide transition-all duration-150 active:scale-95 hover:brightness-110 hover:shadow-lg">
              ചിത്ര കല
            </button>
          </Link>
          <Link href={`/editorial?magazineId=${magazine.id}`} className="flex-1">
            <button className="w-full py-3.5 rounded-2xl bg-navy text-white font-semibold text-[14px] tracking-wide transition-all duration-150 active:scale-95 hover:brightness-125 hover:shadow-lg flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                <line x1="16" y1="8" x2="10" y2="8"/><line x1="16" y1="12" x2="10" y2="12"/><line x1="16" y1="16" x2="10" y2="16"/>
              </svg>
              Editorial
            </button>
          </Link>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
