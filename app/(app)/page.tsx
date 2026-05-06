import { magazines } from "@/lib/data";
import { LogoBar } from "@/components/TopBar";
import SectionHeader from "@/components/SectionHeader";
import { HeroCover, SmallCover } from "@/components/MagazineCover";
import AdBanner from "@/components/AdBanner";
import BottomNav from "@/components/BottomNav";
import BannerSlider from "@/components/BannerSlider";

const banners = [
  { id: "b1", image: "/one.jpeg", href: "/magazine/jun-2025" },
  { id: "b2", image: "/two.jpeg", href: "/magazine/may-2025" },
  { id: "b3", image: "/one.jpeg", href: "/magazine/apr-2025" },
];

export default function Home() {
  const latest = magazines[0];
  const older = magazines.slice(1, 5);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        <LogoBar />
        <BannerSlider banners={banners} />
        <SectionHeader title="പുതിയ ലക്കം" href={`/magazine?id=${latest.id}`} />
        <HeroCover magazine={latest} />
        <SectionHeader title="Old Prints" href="/archive" actionLabel="View All" />
        <div className="grid grid-cols-2 gap-3 px-5">
          {older.map((m) => (
            <SmallCover key={m.id} magazine={m} />
          ))}
        </div>
        <AdBanner />
      </div>
      <BottomNav />
    </>
  );
}
