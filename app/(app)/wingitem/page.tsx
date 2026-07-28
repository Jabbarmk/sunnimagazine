export const revalidate = 60;

import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import { getWingDB } from "@/lib/queries";
import WingItemGallery from "@/components/WingItemGallery";

export default async function WingItemPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id ?? "";
  const item = id ? await getWingDB(id) : null;

  if (!item) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center text-muted text-[14px]">Item not found</div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-[94px] md:pb-[30px]">
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
          <BackButton />
        </div>
        <WingItemGallery caption={item.caption} description={item.description} images={item.images} />
      </div>
      <BottomNav />
    </>
  );
}
