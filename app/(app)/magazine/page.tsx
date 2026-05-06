"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MagazineView from "@/components/MagazineView";
import BottomNav from "@/components/BottomNav";

function MagazineInner() {
  const params = useSearchParams();
  return <MagazineView id={params.get("id") ?? ""} />;
}

export default function MagazinePage() {
  return (
    <Suspense fallback={
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Loading…</div>
        <BottomNav />
      </>
    }>
      <MagazineInner />
    </Suspense>
  );
}
