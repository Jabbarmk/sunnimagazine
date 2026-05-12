export const revalidate = 60;

import { getArtsDB, getMagazinesDB } from "@/lib/queries";
import ArtPageClient from "@/components/ArtPageClient";

export default async function ArtPage() {
  const [arts, magazines] = await Promise.all([getArtsDB(), getMagazinesDB()]);
  const magazineTitle = magazines[0]?.title ?? "";

  return <ArtPageClient arts={arts} magazineTitle={magazineTitle} />;
}
