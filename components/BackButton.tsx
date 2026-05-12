"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "@/components/Icons";

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className={className ?? "w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink flex-shrink-0"}
    >
      <ChevronLeft size={18} />
    </button>
  );
}
