export const revalidate = 60;

import Link from "next/link";
import { getMagazinesDB, getNewsDB, getEventsDB, getTickerDB } from "@/lib/queries";
import type { Magazine } from "@/lib/data";
import { LogoBar } from "@/components/TopBar";
import SectionHeader from "@/components/SectionHeader";
import { HeroCover, SmallCover } from "@/components/MagazineCover";
import BottomNav from "@/components/BottomNav";
import BannerSlider from "@/components/BannerSlider";

const MONTHS: Record<string, number> = {
  january:1,february:2,march:3,april:4,may:5,june:6,
  july:7,august:8,september:9,october:10,november:11,december:12,
};

function sortByDate(list: Magazine[]): Magazine[] {
  return [...list].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year);
    if (yearDiff !== 0) return yearDiff;
    return (MONTHS[b.month.toLowerCase()] ?? 0) - (MONTHS[a.month.toLowerCase()] ?? 0);
  });
}

function fmtEventDate(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function TickerBar({ text, isEnabled }: { text: string; isEnabled: boolean }) {
  if (!isEnabled || !text) return null;
  return (
    <div className="overflow-hidden flex-shrink-0" style={{ background: "#B08A3A" }}>
      <div className="flex items-center" style={{ minHeight: 36 }}>
        <div
          className="flex-shrink-0 flex items-center px-3 self-stretch border-r border-white/30"
          style={{ background: "rgba(0,0,0,0.15)" }}
        >
          <span className="text-white font-bold text-[11px] tracking-widest whitespace-nowrap">★ NOTICE</span>
        </div>
        <div className="overflow-hidden flex-1 px-2">
          <span className="ticker-scroll text-[13px] font-semibold" style={{ color: "#16161C" }}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const [mags, newsItems, events, ticker] = await Promise.all([
    getMagazinesDB(), getNewsDB(), getEventsDB(), getTickerDB(),
  ]);

  const magazines = sortByDate(mags);
  const latest = magazines[0];
  const older = magazines.slice(1, 5);
  const news = newsItems.slice(0, 5);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-4">
        <LogoBar />
        <TickerBar text={ticker.text} isEnabled={ticker.isEnabled} />
        <BannerSlider />
        {latest && (
          <>
            <SectionHeader title="പുതിയ ലക്കം" href={`/magazine?id=${latest.id}`} />
            <HeroCover magazine={latest} />
          </>
        )}
        {older.length > 0 && (
          <>
            <SectionHeader title="Old Prints" href="/archive" actionLabel="View All" />
            <div className="grid grid-cols-2 gap-3 px-5">
              {older.map((m) => (
                <SmallCover key={m.id} magazine={m} />
              ))}
            </div>
          </>
        )}
        {news.length > 0 && (
          <div className="mt-6 mb-2">
            <SectionHeader title="News & Blogs" href="/news" actionLabel="View All" />
            <div className="px-5 space-y-0">
              {news.map((item) => (
                <Link key={item.id} href={`/newsdetail?id=${item.id}`}>
                  <div className="flex gap-3 items-start py-3 border-b border-line last:border-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-20 h-16 object-cover rounded-xl flex-shrink-0" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      {item.categoryName && (
                        <span className="text-[9px] tracking-[0.2em] uppercase text-gold font-medium">{item.categoryName}</span>
                      )}
                      <p className="font-serif text-[14px] text-ink leading-snug mt-0.5 line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.publishedAt && <span className="text-[11px] text-muted">{item.publishedAt}</span>}
                        {item.source && <span className="text-[11px] text-muted">· {item.source}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {events.length > 0 && (
          <div className="mt-6 mb-4">
            <SectionHeader title="Upcoming Events" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
              {events.map((ev) => (
                <Link key={ev.id} href={`/event?id=${ev.id}`} className="flex-shrink-0 w-[200px]">
                  <div className="rounded-2xl overflow-hidden bg-surface shadow-card">
                    {ev.poster ? (
                      <img src={ev.poster} alt={ev.title} className="w-full h-[130px] object-cover block" />
                    ) : (
                      <div className="w-full h-[130px] bg-gold/10 flex items-center justify-center text-[40px]">📅</div>
                    )}
                    <div className="p-3">
                      {ev.eventDate && (
                        <div className="text-[9px] tracking-[0.15em] uppercase text-gold font-semibold mb-1">
                          {fmtEventDate(ev.eventDate)}
                        </div>
                      )}
                      <div className="font-serif text-[13px] text-ink leading-snug line-clamp-2">{ev.title}</div>
                    </div>
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
