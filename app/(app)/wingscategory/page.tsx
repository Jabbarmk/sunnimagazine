export const revalidate = 60;

import Link from "next/link";
import { getWingsCategoryDB, getWingsByCategoryDB } from "@/lib/queries";
import { BackBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import ImgWithFallback from "@/components/ImgWithFallback";

export default async function WingsCategoryPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id ?? "";
  const category = id ? await getWingsCategoryDB(id) : null;
  const items = id ? await getWingsByCategoryDB(id) : [];

  if (!category) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <BackBar title={category.name} subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`} />
        {items.length === 0 ? (
          <p className="px-5 py-16 text-center text-[13px] text-muted">No items yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-5 mt-4">
            {items.map((w: any) => (
              <Link key={w.id} href={`/wingitem?id=${w.id}`} className="block">
                <div className="rounded-2xl overflow-hidden bg-surface shadow-card">
                  <ImgWithFallback
                    src={w.images?.[0]}
                    alt={w.caption}
                    className="w-full h-[140px] object-cover block"
                    fallback={<div className="w-full h-[140px] bg-gold/10 flex items-center justify-center text-[32px]">🖼️</div>}
                  />
                  <div className="p-2.5">
                    <div className="font-serif text-[13px] text-ink leading-snug line-clamp-2">{w.caption}</div>
                    {w.images?.length > 1 && (
                      <div className="text-[10px] text-muted mt-0.5">{w.images.length} photos</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
