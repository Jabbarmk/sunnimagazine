"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ArticleView from "@/components/ArticleView";
import BottomNav from "@/components/BottomNav";
import { isAuthenticated } from "@/lib/auth";

function ArticleInner() {
  const params = useSearchParams();
  const para = params.get("para");
  return <ArticleView id={params.get("id") ?? ""} scrollToPara={para !== null ? Number(para) : undefined} />;
}

export default function ArticlePage() {
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
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Loading…</div>
        <BottomNav />
      </>
    }>
      <ArticleInner />
    </Suspense>
  );
}
