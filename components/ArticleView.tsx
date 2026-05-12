"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArticleBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { hasMalayalam } from "@/lib/text";
import { renderInline } from "@/lib/renderInline";
import { getArticle, getArticles, getGallery } from "@/lib/api";
import { useBookmarks } from "@/lib/bookmarks";
import { Bookmark, User, ImageIcon } from "@/components/Icons";
import ImgWithFallback from "@/components/ImgWithFallback";
import type { GalleryImage } from "@/lib/store";
import type { Article } from "@/lib/data";

export default function ArticleView({ id, scrollToPara }: { id: string; scrollToPara?: number }) {
  const [article, setArticle] = useState<Article | null>(null);
  const { hasPara, togglePara } = useBookmarks();
  const paraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [related, setRelated] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getArticle(id).then((a) => {
      if (!a) return;
      setArticle(a);
      getArticles().then((all) => {
        setRelated(all.filter((x) => x.id !== a.id && x.magazineId === a.magazineId).slice(0, 3));
      });
      getGallery(id).then(setGallery);
      setGalleryIndex(0);
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (scrollToPara !== undefined && article && paraRefs.current[scrollToPara]) {
      setTimeout(() => {
        paraRefs.current[scrollToPara]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [scrollToPara, article]);

  const [loadingArticle, setLoadingArticle] = useState(true);

  useEffect(() => {
    if (id) setLoadingArticle(true);
  }, [id]);

  useEffect(() => {
    if (article || id === "") setLoadingArticle(false);
  }, [article, id]);

  if (loadingArticle && !article) {
    return (
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-[94px] md:pb-[30px]">
          <div className="loading-bar w-full" />
          <div className="w-full h-[320px] skeleton-shimmer" />
          <div className="px-5 pt-5 pb-2 space-y-3">
            <div className="h-3 w-20 rounded skeleton-shimmer" />
            <div className="h-7 rounded skeleton-shimmer w-full" />
            <div className="h-7 rounded skeleton-shimmer w-4/5" />
            <div className="h-px bg-gold/20 my-4" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-28 rounded skeleton-shimmer" />
                <div className="h-2.5 w-36 rounded skeleton-shimmer" />
              </div>
            </div>
          </div>
          <div className="px-5 pt-4 space-y-2">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-3 rounded skeleton-shimmer" style={{ width: `${75 + (i % 4) * 6}%` }} />)}
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

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
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-[94px] md:pb-[30px]">
        <div className="relative">
          <ArticleBar articleId={article.id} />
          <ImgWithFallback src={article.hero} alt={article.title} className="w-full h-[320px] object-cover"
            fallback={<div className="w-full h-[320px] bg-surface flex items-center justify-center text-muted"><ImageIcon size={40} /></div>} />
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
            <ImgWithFallback src={article.avatar} alt={article.author} className="w-10 h-10 rounded-full object-cover"
              fallback={<div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted flex-shrink-0"><User size={18} /></div>} />
            <div className="flex-1">
              <div className="text-[13px] font-medium text-ink">{article.author}</div>
              <div className="text-[11px] text-muted">{article.date} · {article.readTime}</div>
            </div>
          </div>
        </div>

        <article className="px-5 pt-6 pb-8 text-[15.5px] leading-[1.8] text-[#2a2a2d]">
          {article.paragraphs.map((p, i) => {
            const bookmarked = hasPara(article.id, i);
            return (
              <div key={i} ref={(el) => { paraRefs.current[i] = el; }} className="relative">
                <p
                  className={hasMalayalam(p) ? "font-malayalam mb-5 leading-[1.9] pr-6" : "font-body mb-5 pr-6"}
                  style={bookmarked ? { borderLeft: "2px solid #B08A3A", paddingLeft: "10px" } : {}}
                >
                  {renderInline(p)}
                </p>
                <button
                  onClick={() => togglePara(article.id, article.title, i, p)}
                  className="absolute top-0 right-0 p-1"
                  aria-label="Bookmark paragraph"
                  style={{ color: bookmarked ? "#B08A3A" : "rgba(0,0,0,0.18)" }}
                >
                  <Bookmark size={13} filled={bookmarked} />
                </button>
                {i === 1 && article.inlineImage && (
                  <figure className="-mx-1 my-6">
                    <img src={article.inlineImage} alt="" className="w-full h-[220px] object-cover rounded-xl" />
                  </figure>
                )}
                {i === 3 && article.inlineImage2 && (
                  <figure className="-mx-1 my-6">
                    <img src={article.inlineImage2} alt="" className="w-full h-[220px] object-cover rounded-xl" />
                  </figure>
                )}
                {article.pullQuotes?.filter(q => q.afterParagraph === i + 1).map((q, qi) => (
                  <blockquote key={qi} className="border-l-[3px] border-gold pl-4 my-6 font-serif text-[19px] italic text-ink leading-snug">
                    "{q.text}"
                  </blockquote>
                ))}
              </div>
            );
          })}
        </article>

        {gallery.length > 0 && (
          <div className="pb-6">
            <div className="px-5 mb-3">
              <h3 className="font-serif text-[18px] text-ink">Photos</h3>
            </div>
            <div className="px-5">
              <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: "4/3" }}>
                <img
                  src={gallery[galleryIndex].url}
                  alt=""
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-[16px]"
                    >‹</button>
                    <button
                      onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-[16px]"
                    >›</button>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {gallery.map((_, i) => (
                        <button key={i} onClick={() => setGalleryIndex(i)}>
                          <span className={`block rounded-full transition-all duration-300 ${
                            i === galleryIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                          }`} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="text-[11px] text-muted mt-2 text-center">{galleryIndex + 1} / {gallery.length}</p>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="pb-6">
            <div className="px-5 mb-3">
              <h3 className="font-serif text-[18px] text-ink">You may also like</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
              {related.map((r) => (
                <Link key={r.id} href={`/article?id=${r.id}`} className="flex-shrink-0 w-[200px]">
                  <div className="rounded-xl overflow-hidden shadow-card">
                    <ImgWithFallback src={r.hero} className="w-full h-[120px] object-cover"
                      fallback={<div className="w-full h-[120px] bg-surface flex items-center justify-center text-muted"><ImageIcon size={28} /></div>} />
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

        {article.bottomImage && (
          <div className="px-5 pb-6">
            <img src={article.bottomImage} alt="" className="w-full rounded-2xl object-cover" />
          </div>
        )}

        <div className="px-5 pb-10">
          <Link href="/">
            <button className="w-full py-3.5 rounded-2xl border-2 border-gold text-gold font-semibold text-[15px] tracking-wide hover:bg-gold hover:text-white transition-colors">
              More Topics
            </button>
          </Link>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
