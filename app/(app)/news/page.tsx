export const revalidate = 120;

import { getNewsDB, getNewsCategoriesDB } from "@/lib/queries";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import NewsClient from "@/components/NewsClient";

export default async function NewsPage() {
  const [items, cats] = await Promise.all([getNewsDB(), getNewsCategoriesDB()]);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-[94px] md:pb-[30px]">
        <LogoBar />
        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">News &amp; Blogs</h1>
          <p className="text-[12px] text-muted mt-1.5">Latest updates and insights</p>
        </div>
        <NewsClient items={items} cats={cats} />
      </div>
      <BottomNav />
    </>
  );
}
