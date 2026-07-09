"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ImgWithFallback from "@/components/ImgWithFallback";
import type { NewsItem, EventItem } from "@/lib/store";
import { getAppUser } from "@/lib/auth";
import { emirateVisible } from "@/lib/emirates";

function fmtEventDate(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Home-page News & Events, filtered client-side by the logged-in user's emirate.
export default function HomeFeeds({ news, events }: { news: NewsItem[]; events: EventItem[] }) {
  const [emirate, setEmirate] = useState<string | null>(null);
  useEffect(() => { setEmirate(getAppUser()?.emirates ?? ""); }, []);

  const visibleNews = (emirate === null ? news : news.filter((n) => emirateVisible(emirate, n.emirates))).slice(0, 5);
  const visibleEvents = emirate === null ? events : events.filter((e) => emirateVisible(emirate, e.emirates));

  return (
    <>
      {visibleNews.length > 0 && (
        <div className="mt-6 mb-2">
          <SectionHeader title="News & Blogs" href="/news" actionLabel="View All" />
          <div className="px-5 space-y-0">
            {visibleNews.map((item) => (
              <Link key={item.id} href={`/newsdetail?id=${item.id}`}>
                <div className="flex gap-3 items-start py-3 border-b border-line last:border-0">
                  <ImgWithFallback src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                    fallback={<div className="w-20 h-16 bg-surface rounded-xl flex-shrink-0 flex items-center justify-center text-muted text-[22px]">📰</div>} />
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
      {visibleEvents.length > 0 && (
        <div className="mt-6 mb-4">
          <SectionHeader title="Upcoming Events" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
            {visibleEvents.map((ev) => (
              <Link key={ev.id} href={`/event?id=${ev.id}`} className="flex-shrink-0 w-[200px]">
                <div className="rounded-2xl overflow-hidden bg-surface shadow-card">
                  {ev.poster ? (
                    <img src={ev.poster} alt={ev.title} className="w-full h-[130px] object-cover block" />
                  ) : (
                    <div className="w-full h-[130px] bg-gold/10 flex items-center justify-center text-[40px]">📅</div>
                  )}
                  <div className="p-3">
                    {ev.eventDate && (
                      <div className="text-[9px] tracking-[0.15em] uppercase text-gold font-semibold mb-1">
                        {fmtEventDate(ev.eventDate)}
                      </div>
                    )}
                    <div className="font-serif text-[13px] text-ink leading-snug line-clamp-2">{ev.title}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
