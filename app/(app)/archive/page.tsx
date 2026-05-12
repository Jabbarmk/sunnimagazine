export const revalidate = 60;

import { getMagazinesDB } from "@/lib/queries";
import { BackBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import ArchiveClient from "@/components/ArchiveClient";

export default async function ArchivePage() {
  const magazines = await getMagazinesDB();

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <BackBar title="The Magazine" subtitle="Every issue, in one place" />
        <ArchiveClient magazines={magazines} />
      </div>
      <BottomNav />
    </>
  );
}
