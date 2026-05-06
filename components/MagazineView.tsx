"use client";

import { useEffect, useState } from "react";
import { BackBar } from "@/components/TopBar";
import ArticleRow from "@/components/ArticleRow";
import BottomNav from "@/components/BottomNav";
import { getMagazine, getArticles } from "@/lib/store";
import type { Magazine, Article } from "@/lib/data";

export default function MagazineView({ id }: { id: string }) {
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    if (!id) return;
    const m = getMagazine(id);
    if (!m) return;
    setMagazine(m);
    setItems(getArticles().filter((a) => a.magazineId === m.id));
  }, [id]);

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
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <BackBar title={magazine.title} subtitle={`${magazine.month} ${magazine.year}`} />
        <div className="relative mt-1">
          <img src={magazine.cover} alt={magazine.title} className="w-full h-[260px] object-cover" />
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
