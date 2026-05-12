export const revalidate = 60;

import { getVideosDB, getVideoCategoriesDB } from "@/lib/queries";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import VideosClient from "@/components/VideosClient";

export default async function VideosPage() {
  const [videos, categories] = await Promise.all([getVideosDB(), getVideoCategoriesDB()]);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg pb-16 md:pb-0">
        <LogoBar />
        <div className="px-5 mt-4 mb-4">
          <h1 className="font-serif text-[26px] text-ink leading-none">Videos</h1>
          <p className="text-[12px] text-muted mt-1.5">Films, conversations, and short cuts</p>
        </div>
        <VideosClient videos={videos} categories={categories} />
      </div>
      <BottomNav />
    </>
  );
}
