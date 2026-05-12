"use client";

import { useEffect, useState } from "react";
import { BackBar } from "@/components/TopBar";
import { Book } from "@/components/Icons";
import ImgWithFallback from "@/components/ImgWithFallback";
import ArticleRow from "@/components/ArticleRow";
import BottomNav from "@/components/BottomNav";
import { getMagazine, getArticles } from "@/lib/api";
import type { Magazine, Article } from "@/lib/data";

export default function MagazineView({ id }: { id: string }) {
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMagazine(id)
      .then((m) => {
        if (!m) { setLoading(false); return; }
        setMagazine(m);
        return getArticles().then((all) => setItems(all.filter((a) => a.magazineId === m.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0">
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
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0">
        <BackBar title={magazine.title} subtitle={`${magazine.month} ${magazine.year}`} />
        <div className="relative mt-1">
          <ImgWithFallback src={magazine.cover} alt={magazine.title} className="w-full h-[100px] object-cover"
            fallback={<div className="w-full h-[100px] bg-surface flex items-center justify-center text-muted"><Book size={32} /></div>} />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        </div>
        <div className="px-5 pt-5 pb-2">
          <div className="text-[9px] tracking-[0.25em] text-gold uppercase">In this issue</div>
          <h1 className="font-malayalam font-bold text-[26px] text-ink mt-1 leading-[1.3]">{magazine.title}</h1>
          <p className="text-[13px] text-muted italic mt-2">{magazine.description}</p>
        </div>
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
      </div>
      <BottomNav />
    </>
  );
}
