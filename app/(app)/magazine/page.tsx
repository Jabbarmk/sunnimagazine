"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MagazineView from "@/components/MagazineView";
import BottomNav from "@/components/BottomNav";
import { isAuthenticated } from "@/lib/auth";

function MagazineInner() {
  const params = useSearchParams();
  return <MagazineView id={params.get("id") ?? ""} />;
}

export default function MagazinePage() {
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
      <MagazineInner />
    </Suspense>
  );
}
