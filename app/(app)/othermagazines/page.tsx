export const revalidate = 60;

import { getOtherMagazinesDB } from "@/lib/queries";
import { BackBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import OtherMagazines from "@/components/OtherMagazines";

export default async function OtherMagazinesPage() {
  const items = await getOtherMagazinesDB(500);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <BackBar title="Other Magazines" subtitle="Cover & PDF issues" />
        <div className="mt-4">
          <OtherMagazines items={items} variant="grid" showHeader={false} />
        </div>
      </div>
      <BottomNav />
    </>
  );
}
