export const revalidate = 60;

import { getWingsCategoriesDB } from "@/lib/queries";
import { BackBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import WingsCategories from "@/components/WingsCategories";

export default async function WingsPage() {
  const items = await getWingsCategoriesDB(500);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <BackBar title="Wings" subtitle="Our community wings" />
        <div className="mt-4">
          <WingsCategories items={items} variant="grid" showHeader={false} />
        </div>
      </div>
      <BottomNav />
    </>
  );
}
