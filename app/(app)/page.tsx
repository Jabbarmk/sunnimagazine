"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMagazines, getArticles } from "@/lib/api";
import type { Magazine } from "@/lib/data";
import type { Article } from "@/lib/data";
import { LogoBar } from "@/components/TopBar";
import SectionHeader from "@/components/SectionHeader";
import { HeroCover, SmallCover } from "@/components/MagazineCover";
import BottomNav from "@/components/BottomNav";
import BannerSlider from "@/components/BannerSlider";

const MONTHS: Record<string, number> = {
  january:1,february:2,march:3,april:4,may:5,june:6,
  july:7,august:8,september:9,october:10,november:11,december:12,
};

function sortByDate(list: Magazine[]): Magazine[] {
  return [...list].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year);
    if (yearDiff !== 0) return yearDiff;
    return (MONTHS[b.month.toLowerCase()] ?? 0) - (MONTHS[a.month.toLowerCase()] ?? 0);
  });
}

export default function Home() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [newsArticles, setNewsArticles] = useState<Article[]>([]);

  useEffect(() => {
    getMagazines().then((mags) => setMagazines(sortByDate(mags)));
    getArticles().then((articles) => setNewsArticles(articles.slice(0, 5)));
  }, []);

  const latest = magazines[0];
  const older = magazines.slice(1, 5);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-4">
        <LogoBar />
        <BannerSlider />
        {latest && (
          <>
            <SectionHeader title="പുതിയ ലക്കം" href={`/magazine?id=${latest.id}`} />
            <HeroCover magazine={latest} />
          </>
        )}
        {older.length > 0 && (
          <>
            <SectionHeader title="Old Prints" href="/archive" actionLabel="View All" />
            <div className="grid grid-cols-2 gap-3 px-5">
              {older.map((m) => (
                <SmallCover key={m.id} magazine={m} />
              ))}
            </div>
          </>
        )}
        {/* News & Blogs */}
        {newsArticles.length > 0 && (
          <div className="mt-6 mb-2">
            <SectionHeader title="News & Blogs" href="/archive" actionLabel="View All" />
            <div className="px-5 space-y-3">
              {newsArticles.map((a) => (
                <Link key={a.id} href={`/article?id=${a.id}`}>
                  <div className="flex gap-3 items-start py-3 border-b border-line last:border-0">
                    {a.hero && (
                      <img src={a.hero} alt={a.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {a.category && (
                        <span className="text-[9px] tracking-[0.2em] uppercase text-gold font-medium">{a.category}</span>
                      )}
                      <p className="font-serif text-[14px] text-ink leading-snug mt-0.5 line-clamp-2">{a.title}</p>
                      {a.date && (
                        <span className="text-[11px] text-muted mt-1 block">{a.date}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
