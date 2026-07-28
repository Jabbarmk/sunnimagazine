import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ImgWithFallback from "@/components/ImgWithFallback";

type WingsCategory = { id: string; name: string; image: string; itemCount?: number };

// Home-page "Wings" section: horizontal row of category covers, below Other
// Magazines. Tapping a category opens its item list (/wingscategory?id=).
export default function WingsCategories({
  items,
  variant = "row",
  href,
  showHeader = true,
}: {
  items: WingsCategory[];
  variant?: "row" | "grid";
  href?: string;
  showHeader?: boolean;
}) {
  if (!items || items.length === 0) {
    return variant === "grid"
      ? <p className="px-5 py-16 text-center text-[13px] text-muted">No wings yet.</p>
      : null;
  }

  const Card = ({ c }: { c: WingsCategory }) => (
    <Link href={`/wingscategory?id=${c.id}`} className="block">
      <div className="rounded-2xl overflow-hidden bg-surface shadow-card">
        <ImgWithFallback
          src={c.image}
          alt={c.name}
          className={`w-full object-cover block ${variant === "grid" ? "h-[160px]" : "h-[120px]"}`}
          fallback={<div className={`w-full ${variant === "grid" ? "h-[160px]" : "h-[120px]"} bg-gold/10 flex items-center justify-center text-[36px]`}>🪶</div>}
        />
        <div className="p-2.5">
          <div className="font-serif text-[13px] text-ink leading-snug line-clamp-1">{c.name}</div>
          {typeof c.itemCount === "number" && (
            <div className="text-[10px] text-muted mt-0.5">{c.itemCount} item{c.itemCount === 1 ? "" : "s"}</div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className={variant === "row" ? "mt-6 mb-4" : "mb-4"}>
      {showHeader && <SectionHeader title="Wings" href={href} actionLabel="View All" />}
      {variant === "row" ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {items.map((c) => (
            <div key={c.id} className="flex-shrink-0 w-[140px]"><Card c={c} /></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5">
          {items.map((c) => <Card key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
