import Link from "next/link";
import { ArrowRight } from "./Icons";
import { hasMalayalam } from "@/lib/text";

export default function SectionHeader({
  title,
  actionLabel = "View More",
  href,
}: {
  title: string;
  actionLabel?: string;
  href?: string;
}) {
  const ml = hasMalayalam(title);
  return (
    <div className="flex items-end justify-between px-5 mt-6 mb-3">
      <h2
        className={
          ml
            ? "font-malayalam font-bold text-[20px] text-ink leading-none"
            : "font-sans text-[20px] text-ink leading-none"
        }
      >
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-[12px] text-muted flex items-center gap-1 hover:text-ink">
          {actionLabel}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
