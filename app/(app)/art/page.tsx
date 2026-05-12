export const revalidate = 60;

import { getArtsDB, getMagazinesDB } from "@/lib/queries";
import ArtPageClient from "@/components/ArtPageClient";

export default async function ArtPage({ searchParams }: { searchParams: { magazineId?: string } }) {
  const [arts, magazines] = await Promise.all([getArtsDB(), getMagazinesDB()]);
  const magazineId = searchParams.magazineId ?? "";
  const filtered = magazineId ? arts.filter((a) => a.magazineId === magazineId) : arts;
  const magazine = magazines.find((m) => m.id === magazineId);
  const magazineTitle = magazine?.title ?? magazines[0]?.title ?? "";

  return <ArtPageClient arts={filtered} magazineTitle={magazineTitle} />;
}
