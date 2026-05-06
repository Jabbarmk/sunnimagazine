"use client";

import { useBookmarks } from "@/lib/bookmarks";
import { articles } from "@/lib/data";
import ArticleRow from "@/components/ArticleRow";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { Bookmark } from "@/components/Icons";
import { useState } from "react";
import clsx from "clsx";

export default function BookmarksPage() {
  const { ids, remove } = useBookmarks();
  const [swiped, setSwiped] = useState<string | null>(null);
  const saved = articles.filter((a) => ids.includes(a.id));

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <LogoBar />
        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">Bookmarks</h1>
          <p className="text-[12px] text-muted mt-1.5">Your saved stories</p>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-8 mt-12">
            <div className="w-16 h-16 rounded-full bg-surface shadow-card flex items-center justify-center text-muted mb-4">
              <Bookmark size={26} />
            </div>
            <div className="font-serif text-[17px] text-ink">Nothing saved yet</div>
            <p className="text-[12px] text-muted mt-1 max-w-[240px]">
              Tap the bookmark icon on any article to save it here.
            </p>
          </div>
        ) : (
          <div>
            {saved.map((a, i) => (
              <div
                key={a.id}
                className={clsx(
                  "relative overflow-hidden",
                  i > 0 && "border-t border-line"
                )}
                onTouchStart={(e) => {
                  (e.currentTarget as any)._x = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const start = (e.currentTarget as any)._x ?? 0;
                  const delta = e.changedTouches[0].clientX - start;
                  if (delta < -40) setSwiped(a.id);
                  else if (delta > 20) setSwiped(null);
                }}
              >
                <div
                  className={clsx(
                    "transition-transform duration-200",
                    swiped === a.id ? "-translate-x-20" : "translate-x-0"
                  )}
                >
                  <ArticleRow article={a} showBookmark />
                </div>
                <button
                  onClick={() => {
                    remove(a.id);
                    setSwiped(null);
                  }}
                  className={clsx(
                    "absolute top-0 right-0 h-full w-20 bg-accent text-white text-[12px] font-medium flex items-center justify-center transition-opacity",
                    swiped === a.id ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="text-center text-[10px] text-subtle mt-5 px-5">
              Swipe a card left to remove.
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
