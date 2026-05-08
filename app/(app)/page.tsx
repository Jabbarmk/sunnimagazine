"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMagazines, getNews } from "@/lib/api";
import type { Magazine } from "@/lib/data";
import type { NewsItem } from "@/lib/store";
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    getMagazines().then((mags) => setMagazines(sortByDate(mags)));
    getNews().then((items) => setNewsItems(items.slice(0, 5)));
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
        {newsItems.length > 0 && (
          <div className="mt-6 mb-2">
            <SectionHeader title="News & Blogs" href="/news" actionLabel="View All" />
            <div className="px-5 space-y-0">
              {newsItems.map((item) => (
                <Link key={item.id} href={`/newsdetail?id=${item.id}`}>
                  <div className="flex gap-3 items-start py-3 border-b border-line last:border-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      {item.categoryName && (
                        <span className="text-[9px] tracking-[0.2em] uppercase text-gold font-medium">{item.categoryName}</span>
                      )}
                      <p className="font-serif text-[14px] text-ink leading-snug mt-0.5 line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.publishedAt && <span className="text-[11px] text-muted">{item.publishedAt}</span>}
                        {item.source && <span className="text-[11px] text-muted">· {item.source}</span>}
                      </div>
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
