"use client";

import { useBookmarks } from "@/lib/bookmarks";
import { articles } from "@/lib/data";
import ArticleRow from "@/components/ArticleRow";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Bookmark } from "@/components/Icons";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function BookmarksPage() {
  const { ids, remove, paraBookmarks, removePara } = useBookmarks();
  const [swiped, setSwiped] = useState<string | null>(null);
  const saved = articles.filter((a) => ids.includes(a.id));
  const hasAny = saved.length > 0 || paraBookmarks.length > 0;

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0">
        <LogoBar />
        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">Bookmarks</h1>
          <p className="text-[12px] text-muted mt-1.5">Your saved stories & passages</p>
        </div>

        {!hasAny ? (
          <div className="flex flex-col items-center justify-center text-center px-8 mt-12">
            <div className="w-16 h-16 rounded-full bg-surface shadow-card flex items-center justify-center text-muted mb-4">
              <Bookmark size={26} />
            </div>
            <div className="font-serif text-[17px] text-ink">Nothing saved yet</div>
            <p className="text-[12px] text-muted mt-1 max-w-[240px]">
              Tap the bookmark icon on any article or paragraph to save it here.
            </p>
          </div>
        ) : (
          <>
            {/* Article bookmarks */}
            {saved.length > 0 && (
              <div>
                <div className="px-5 mb-2">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-gold font-semibold">Articles</span>
                </div>
                {saved.map((a, i) => (
                  <div
                    key={a.id}
                    className={clsx("relative overflow-hidden", i > 0 && "border-t border-line")}
                    onTouchStart={(e) => { (e.currentTarget as any)._x = e.touches[0].clientX; }}
                    onTouchEnd={(e) => {
                      const start = (e.currentTarget as any)._x ?? 0;
                      const delta = e.changedTouches[0].clientX - start;
                      if (delta < -40) setSwiped(a.id);
                      else if (delta > 20) setSwiped(null);
                    }}
                  >
                    <div className={clsx("transition-transform duration-200", swiped === a.id ? "-translate-x-20" : "translate-x-0")}>
                      <ArticleRow article={a} showBookmark />
                    </div>
                    <button
                      onClick={() => { remove(a.id); setSwiped(null); }}
                      className={clsx(
                        "absolute top-0 right-0 h-full w-20 bg-accent text-white text-[12px] font-medium flex items-center justify-center transition-opacity",
                        swiped === a.id ? "opacity-100" : "opacity-0 pointer-events-none"
                      )}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Paragraph bookmarks */}
            {paraBookmarks.length > 0 && (
              <div className={saved.length > 0 ? "mt-6" : ""}>
                <div className="px-5 mb-2">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-gold font-semibold">Passages</span>
                </div>
                {paraBookmarks
                  .slice()
                  .sort((a, b) => b.savedAt - a.savedAt)
                  .map((b, i) => (
                    <div
                      key={b.id}
                      className={clsx("relative overflow-hidden", i > 0 && "border-t border-line")}
                      onTouchStart={(e) => { (e.currentTarget as any)._x = e.touches[0].clientX; }}
                      onTouchEnd={(e) => {
                        const start = (e.currentTarget as any)._x ?? 0;
                        const delta = e.changedTouches[0].clientX - start;
                        if (delta < -40) setSwiped(b.id);
                        else if (delta > 20) setSwiped(null);
                      }}
                    >
                      <div className={clsx("transition-transform duration-200", swiped === b.id ? "-translate-x-20" : "translate-x-0")}>
                        <Link href={`/article?id=${b.articleId}&para=${b.paragraphIndex}`}>
                          <div className="px-5 py-3.5">
                            <div className="text-[10px] tracking-[0.18em] uppercase text-gold font-medium mb-1.5 line-clamp-1">
                              {b.articleTitle}
                            </div>
                            <p className="text-[13.5px] text-ink leading-snug line-clamp-3 border-l-2 border-gold pl-3">
                              {b.excerpt}
                            </p>
                          </div>
                        </Link>
                      </div>
                      <button
                        onClick={() => { removePara(b.id); setSwiped(null); }}
                        className={clsx(
                          "absolute top-0 right-0 h-full w-20 bg-accent text-white text-[12px] font-medium flex items-center justify-center transition-opacity",
                          swiped === b.id ? "opacity-100" : "opacity-0 pointer-events-none"
                        )}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <div className="text-center text-[10px] text-subtle mt-5 px-5 pb-4">
              Swipe a card left to remove.
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </>
  );
}
