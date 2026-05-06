"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArticleView from "@/components/ArticleView";
import BottomNav from "@/components/BottomNav";

function ArticleInner() {
  const params = useSearchParams();
  return <ArticleView id={params.get("id") ?? ""} />;
}

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Loading…</div>
        <BottomNav />
      </>
    }>
      <ArticleInner />
    </Suspense>
  );
}
