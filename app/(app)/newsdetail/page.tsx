"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getNewsItem } from "@/lib/api";
import type { NewsItem } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft } from "@/components/Icons";
import { isAuthenticated } from "@/lib/auth";

function NewsDetailInner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const router = useRouter();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    getNewsItem(id)
      .then((data) => setItem(data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">News item not found</div>
        <BottomNav />
      </>
    );
  }

  if (!item) {
    return (
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-[94px] md:pb-[30px]">
          <div className="w-full h-[280px] skeleton-shimmer" />
          <div className="px-5 pt-5 space-y-3">
            <div className="h-7 rounded skeleton-shimmer w-5/6" />
            <div className="h-7 rounded skeleton-shimmer w-3/4" />
            <div className="flex gap-2 mt-3">
              <div className="h-3 w-20 rounded skeleton-shimmer" />
              <div className="h-3 w-24 rounded skeleton-shimmer" />
            </div>
            <div className="h-px bg-gold/20 my-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-3 rounded skeleton-shimmer" style={{ width: `${85 + (i % 3) * 5}%` }} />
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg">
        {/* Hero image with back button overlay */}
        {item.image ? (
          <div className="relative">
            <img src={item.image} alt={item.title} className="w-full h-[280px] object-cover block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={() => router.back()}
              className="absolute top-5 left-5 w-10 h-10 rounded-full bg-surface/90 backdrop-blur shadow-card flex items-center justify-center text-ink"
            >
              <ChevronLeft size={18} />
            </button>
            {item.categoryName && (
              <div className="absolute bottom-4 left-5">
                <span className="inline-block text-[9px] tracking-[0.22em] uppercase bg-gold text-white px-2.5 py-1 rounded-full font-medium">
                  {item.categoryName}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
            >
              <ChevronLeft size={18} />
            </button>
            {item.categoryName && (
              <span className="text-[9px] tracking-[0.22em] uppercase text-gold font-medium">{item.categoryName}</span>
            )}
            <div className="w-9" />
          </div>
        )}

        <div className="px-5 pt-5 pb-2">
          <h1 className="font-serif text-[26px] text-ink leading-[1.2]">{item.title}</h1>

          <div className="flex items-center gap-2 mt-3">
            {item.publishedAt && (
              <span className="text-[12px] text-muted">{item.publishedAt}</span>
            )}
            {item.publishedAt && item.source && (
              <span className="text-muted text-[12px]">·</span>
            )}
            {item.source && (
              <span className="text-[12px] text-gold font-medium">{item.source}</span>
            )}
          </div>

          <div className="h-px bg-gold/40 my-5" />
        </div>

        {item.description && (
          <div className="px-5 pb-10">
            <p className="text-[15px] leading-[1.9] text-ink/85 whitespace-pre-wrap" lang="ml">
              {item.description}
            </p>
          </div>
        )}

        <div className="px-5 pb-10">
          <button
            onClick={() => router.back()}
            className="w-full py-3.5 rounded-2xl border-2 border-gold text-gold font-semibold text-[15px] tracking-wide hover:bg-gold hover:text-white transition-colors"
          >
            Back to News
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}

function AuthGuardedDetail() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
    else setAuthed(true);
  }, [router]);
  if (!authed) return null;
  return (
    <Suspense fallback={
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-[94px] md:pb-[30px]">
          <div className="w-full h-[280px] skeleton-shimmer" />
          <div className="px-5 pt-5 space-y-3">
            <div className="h-7 rounded skeleton-shimmer w-5/6" />
            <div className="h-7 rounded skeleton-shimmer w-3/4" />
          </div>
        </div>
        <BottomNav />
      </>
    }>
      <NewsDetailInner />
    </Suspense>
  );
}

export default function NewsDetailPage() {
  return <AuthGuardedDetail />;
}
