"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getNews, getNewsCategories } from "@/lib/api";
import type { NewsItem, NewsCategory } from "@/lib/store";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { isAuthenticated } from "@/lib/auth";

export default function NewsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [cats, setCats] = useState<NewsCategory[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    setAuthed(true);
    Promise.all([getNews(), getNewsCategories()])
      .then(([news, catData]) => { setItems(news); setCats(catData); })
      .finally(() => setLoading(false));
  }, [router]);

  if (!authed) return null;

  const tabs = ["All", ...cats.map((c) => c.name)];
  const filtered = activeTab === "All" ? items : items.filter((n) => n.categoryName === activeTab);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-16 md:pb-0">
        <LogoBar />

        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">News &amp; Blogs</h1>
          <p className="text-[12px] text-muted mt-1.5">Latest updates and insights</p>
        </div>

        {cats.length > 0 && (
          <div className="flex gap-5 overflow-x-auto no-scrollbar px-5 pb-2 border-b border-line mb-5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 text-[13px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  activeTab === t ? "border-gold text-ink font-medium" : "border-transparent text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="pb-6">
            <div className="loading-bar w-full mb-4" />
            <div className="px-5 space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 py-3.5 border-b border-line">
                <div className="w-20 h-16 rounded-xl skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-2.5 rounded skeleton-shimmer w-16" />
                  <div className="h-3 rounded skeleton-shimmer w-full" />
                  <div className="h-3 rounded skeleton-shimmer w-3/4" />
                  <div className="h-2.5 rounded skeleton-shimmer w-24" />
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px] text-muted">No news yet.</p>
          </div>
        ) : (
          <div className="px-5 space-y-0 pb-6">
            {filtered.map((item) => (
              <Link key={item.id} href={`/newsdetail?id=${item.id}`}>
                <div className="flex gap-3 items-start py-3.5 border-b border-line last:border-0">
                  {item.image ? (
                    <img src={item.image} alt={item.title}
                      className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-16 bg-surface rounded-xl flex-shrink-0 flex items-center justify-center text-muted text-[22px]">📰</div>
                  )}
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
        )}
      </div>
      <BottomNav />
    </>
  );
}
