"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getEvent } from "@/lib/api";
import type { EventItem } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft } from "@/components/Icons";

function EventDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [event, setEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    if (!id) return;
    getEvent(id).then((e) => setEvent(e ?? null)).catch(() => {});
  }, [id]);

  if (!event) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-16 md:pb-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          {event.title && (
            <h1 className="font-serif text-[18px] text-ink leading-[1.2] flex-1">{event.title}</h1>
          )}
        </div>

        <div className="px-5 pt-2 pb-10 space-y-5">
          {event.poster && (
            <img src={event.poster} alt={event.title} className="w-full rounded-2xl object-cover" />
          )}

          {event.eventDate && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-[0.15em] uppercase text-gold font-semibold">Date</span>
              <span className="text-[14px] text-ink font-medium">{event.eventDate}</span>
            </div>
          )}

          {event.description && (
            <p className="text-[15px] text-[#2a2a2d] leading-[1.8] whitespace-pre-line">{event.description}</p>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}

export default function EventPage() {
  return (
    <Suspense fallback={
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Loading…</div>
        <BottomNav />
      </>
    }>
      <EventDetail />
    </Suspense>
  );
}
