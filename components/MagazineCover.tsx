import Link from "next/link";
import { Magazine } from "@/lib/data";
import { Book } from "@/components/Icons";
import ImgWithFallback from "@/components/ImgWithFallback";

export function HeroCover({ magazine }: { magazine: Magazine }) {
  return (
    <Link href={`/magazine?id=${magazine.id}`} className="block px-5">
      <div className="relative rounded-card overflow-hidden shadow-card bg-surface">
        <ImgWithFallback src={magazine.cover} alt={magazine.title} className="w-full h-auto block"
          fallback={<div className="w-full aspect-[3/4] bg-surface flex items-center justify-center text-muted"><Book size={40} /></div>} />
        <span className="absolute bottom-14 left-3 z-[1] text-[9px] tracking-[0.22em] uppercase bg-gold text-white px-2.5 py-1 rounded-full font-medium shadow-card">
          Latest Issue
        </span>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="inline-block w-[3px] h-5 bg-gold rounded-sm" />
          <span className="text-[16px] text-ink font-bold">{magazine.month} {magazine.year}</span>
        </div>
      </div>
    </Link>
  );
}

export function SmallCover({ magazine, showLatest }: { magazine: Magazine; showLatest?: boolean }) {
  return (
    <Link href={`/magazine?id=${magazine.id}`} className="block">
      <div className="relative rounded-2xl overflow-hidden shadow-card">
        {showLatest && (
          <span className="absolute top-2 left-2 z-10 text-[8px] tracking-[0.22em] uppercase bg-gold text-white px-2 py-0.5 rounded">
            Latest
          </span>
        )}
        <ImgWithFallback src={magazine.cover} alt={magazine.title} className="w-full aspect-[3/4] object-cover block"
          fallback={<div className="w-full aspect-[3/4] bg-surface flex items-center justify-center text-muted"><Book size={32} /></div>} />
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[11px] text-muted">
          {magazine.month} {magazine.year}
        </div>
      </div>
    </Link>
  );
}
