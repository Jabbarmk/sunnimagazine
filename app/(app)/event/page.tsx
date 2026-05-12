export const revalidate = 60;

import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import ImgWithFallback from "@/components/ImgWithFallback";
import { getEventDB } from "@/lib/queries";

function fmtEventDate(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function EventPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id ?? "";
  const event = id ? await getEventDB(id) : null;

  if (!event) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Event not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-16 md:pb-0">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <BackButton />
          {event.title && (
            <h1 className="font-serif text-[18px] text-ink leading-[1.2] flex-1">{event.title}</h1>
          )}
        </div>

        <div className="px-5 pt-2 pb-10 space-y-5">
          <ImgWithFallback
            src={event.poster}
            alt={event.title ?? ""}
            className="w-full rounded-2xl object-cover"
            fallback={null}
          />

          {event.eventDate && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-[0.15em] uppercase text-gold font-semibold">Date</span>
              <span className="text-[14px] text-ink font-medium">{fmtEventDate(event.eventDate)}</span>
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
