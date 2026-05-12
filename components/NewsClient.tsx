"use client";

import { useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/store";

type Cat = { id: string; name: string };

export default function NewsClient({ items, cats }: { items: NewsItem[]; cats: Cat[] }) {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", ...cats.map((c) => c.name)];
  const filtered = activeTab === "All" ? items : items.filter((n) => n.categoryName === activeTab);

  return (
    <>
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

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[13px] text-muted">No news yet.</p>
        </div>
      ) : (
        <div className="px-5 space-y-0 pb-6">
          {filtered.map((item) => (
            <Link key={item.id} href={`/newsdetail?id=${item.id}`}>
              <div className="flex gap-3 items-start py-3.5 border-b border-line last:border-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
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
    </>
  );
}
