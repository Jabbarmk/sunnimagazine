import Link from "next/link";
import { Magazine } from "@/lib/data";

export function HeroCover({ magazine }: { magazine: Magazine }) {
  return (
    <Link href={`/magazine?id=${magazine.id}`} className="block px-5">
      <div className="relative rounded-card overflow-hidden shadow-card bg-surface aspect-[3/4]">
        <img
          src={magazine.cover}
          alt={magazine.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute top-3 left-3 z-[1] text-[9px] tracking-[0.22em] uppercase bg-gold text-white px-2.5 py-1 rounded-full font-medium shadow-card">
          Latest Issue
        </span>
      </div>
      <div className="flex items-center gap-3 mt-3 pl-1">
        <span className="inline-block w-[3px] h-4 bg-gold rounded-sm" />
        <span className="text-[13px] text-muted">
          {magazine.month} {magazine.year}
        </span>
      </div>
    </Link>
  );
}

export function SmallCover({ magazine, showLatest }: { magazine: Magazine; showLatest?: boolean }) {
  return (
    <Link href={`/magazine?id=${magazine.id}`} className="block">
      <div className="relative rounded-2xl overflow-hidden shadow-card aspect-[3/4]">
        {showLatest && (
          <span className="absolute top-2 left-2 z-10 text-[8px] tracking-[0.22em] uppercase bg-gold text-white px-2 py-0.5 rounded">
            Latest
          </span>
        )}
        <img
          src={magazine.cover}
          alt={magazine.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[11px] text-muted">
          {magazine.month} {magazine.year}
        </div>
      </div>
    </Link>
  );
}
