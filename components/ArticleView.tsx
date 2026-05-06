"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticleBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { hasMalayalam } from "@/lib/text";
import { getArticle, getArticles } from "@/lib/store";
import type { Article } from "@/lib/data";

export default function ArticleView({ id }: { id: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);

  useEffect(() => {
    if (!id) return;
    const a = getArticle(id);
    if (!a) return;
    setArticle(a);
    setRelated(getArticles().filter((x) => x.id !== a.id && x.magazineId === a.magazineId).slice(0, 3));
  }, [id]);

  if (!article) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Article not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg">
        <div className="relative">
          <ArticleBar articleId={article.id} />
          <img src={article.hero} alt={article.title} className="w-full h-[320px] object-cover" />
          <div className="absolute bottom-3 left-5">
            <span className={hasMalayalam(article.category)
              ? "inline-block font-malayalam font-semibold text-[11px] bg-gold text-white px-2.5 py-1 rounded-full"
              : "inline-block text-[9px] tracking-[0.22em] uppercase bg-gold text-white px-2.5 py-1 rounded-full"}>
              {article.category}
            </span>
          </div>
        </div>

        <div className="px-5 pt-6">
          <h1 className={hasMalayalam(article.title)
            ? "font-malayalam font-bold text-[28px] text-ink leading-[1.3]"
            : "font-serif text-[28px] text-ink leading-[1.15]"}>
            {article.title}
          </h1>
          <p className="text-[15px] text-muted italic mt-3 leading-snug">{article.caption}</p>
          <div className="h-px bg-gold/50 my-5" />
          <div className="flex items-center gap-3">
            <img src={article.avatar} alt={article.author} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-ink">{article.author}</div>
              <div className="text-[11px] text-muted">{article.date} · {article.readTime}</div>
            </div>
          </div>
        </div>

        <article className="px-5 pt-6 pb-8 text-[15.5px] leading-[1.8] text-[#2a2a2d]">
          {article.paragraphs.map((p, i) => (
            <div key={i}>
              <p className={hasMalayalam(p) ? "font-malayalam mb-5 leading-[1.9]" : "font-body mb-5"}>{p}</p>
              {i === 1 && article.inlineImage && (
                <figure className="-mx-1 my-6">
                  <img src={article.inlineImage} alt="" className="w-full h-[220px] object-cover rounded-xl" />
                  <figcaption className="text-[11px] italic text-muted mt-2">Photograph by the author.</figcaption>
                </figure>
              )}
              {i === 2 && article.pullQuote && (
                <blockquote className="border-l-[3px] border-gold pl-4 my-6 font-serif text-[19px] italic text-ink leading-snug">
                  "{article.pullQuote}"
                </blockquote>
              )}
            </div>
          ))}
        </article>

        {related.length > 0 && (
          <div className="pb-6">
            <div className="px-5 mb-3">
              <h3 className="font-serif text-[18px] text-ink">You may also like</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
              {related.map((r) => (
                <Link key={r.id} href={`/article?id=${r.id}`} className="flex-shrink-0 w-[200px]">
                  <div className="rounded-xl overflow-hidden shadow-card">
                    <img src={r.hero} className="w-full h-[120px] object-cover" alt="" />
                  </div>
                  <div className="mt-2">
                    <div className="text-[8px] tracking-[0.22em] text-gold">{r.category}</div>
                    <div className="font-serif text-[13px] text-ink leading-snug mt-1 line-clamp-2">{r.title}</div>
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
