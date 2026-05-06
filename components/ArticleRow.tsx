"use client";

import Link from "next/link";
import { Article } from "@/lib/data";
import { ChevronRight, Bookmark } from "./Icons";
import { useBookmarks } from "@/lib/bookmarks";
import { hasMalayalam } from "@/lib/text";
import clsx from "clsx";

export default function ArticleRow({
  article,
  showBookmark,
  onRemove,
}: {
  article: Article;
  showBookmark?: boolean;
  onRemove?: (id: string) => void;
}) {
  const { has } = useBookmarks();
  const saved = has(article.id);

  return (
    <Link
      href={`/article?id=${article.id}`}
      className="flex items-center gap-3 px-5 py-3 active:bg-line/40"
    >
      <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 shadow-card">
        <img src={article.hero} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={
            hasMalayalam(article.category)
              ? "font-malayalam text-[12px] text-gold font-semibold"
              : "text-[9px] tracking-[0.22em] text-gold font-medium"
          }
        >
          {article.category}
        </div>
        <div
          className={
            hasMalayalam(article.title)
              ? "font-malayalam font-bold text-[15px] text-ink leading-snug mt-1 line-clamp-2"
              : "font-serif text-[15px] text-ink leading-snug mt-1 line-clamp-2"
          }
        >
          {article.title}
        </div>
        <div className="text-[11px] text-muted italic mt-1">{article.author}</div>
      </div>
      <div className="flex flex-col items-center gap-2 text-muted">
        {showBookmark && (
          <span className={clsx("text-accent")}>
            <Bookmark size={16} filled />
          </span>
        )}
        <ChevronRight size={16} />
      </div>
    </Link>
  );
}
