export const revalidate = 60;

import { getMagazinesDB, getNewsDB, getEventsDB, getTickerDB, getOtherMagazinesDB } from "@/lib/queries";
import type { Magazine } from "@/lib/data";
import { LogoBar } from "@/components/TopBar";
import SectionHeader from "@/components/SectionHeader";
import { HeroCover, SmallCover } from "@/components/MagazineCover";
import BottomNav from "@/components/BottomNav";
import BannerSlider from "@/components/BannerSlider";
import HomeFeeds from "@/components/HomeFeeds";
import OtherMagazines from "@/components/OtherMagazines";

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
  const [mags, newsItems, events, ticker, otherMags] = await Promise.all([
    getMagazinesDB(), getNewsDB(), getEventsDB(), getTickerDB(), getOtherMagazinesDB(5),
  ]);

  const magazines = sortByDate(mags);
  const latest = magazines[0];
  const older = magazines.slice(1, 5);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
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
        <OtherMagazines items={otherMags} variant="row" href="/othermagazines" />
        <HomeFeeds news={newsItems} events={events} />
      </div>
      <BottomNav />
    </>
  );
}
