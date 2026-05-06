"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Share, Bookmark, Menu, Bell } from "./Icons";
import { useBookmarks } from "@/lib/bookmarks";
import { useState, useEffect } from "react";
import clsx from "clsx";

export function LogoBar() {
  return (
    <div className="pt-5 pb-3">
      <div className="relative flex items-center justify-center">
        <button
          aria-label="Menu"
          className="absolute left-5 w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
        >
          <Menu size={18} />
        </button>
        <img
          src="/logo.png"
          alt="Gulf Sathyadhara"
          className="w-[60%] h-auto object-contain"
        />
      </div>
    </div>
  );
}

export function BackBar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <button
        onClick={() => router.back()}
        className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="text-center">
        {title && <div className="font-serif text-[18px] leading-none text-ink">{title}</div>}
        {subtitle && <div className="text-[11px] text-muted mt-1">{subtitle}</div>}
      </div>
      <div className="w-9 h-9" />
    </div>
  );
}

export function ArticleBar({ articleId }: { articleId: string }) {
  const router = useRouter();
  const { has, toggle } = useBookmarks();
  const [pulse, setPulse] = useState(false);
  const saved = has(articleId);

  const onToggle = () => {
    toggle(articleId);
    if (!saved) {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-5">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full bg-surface/90 backdrop-blur shadow-card flex items-center justify-center text-ink"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-surface/90 backdrop-blur shadow-card flex items-center justify-center text-ink">
          <Share size={17} />
        </button>
        <button
          onClick={onToggle}
          className={clsx(
            "w-10 h-10 rounded-full bg-surface/90 backdrop-blur shadow-card flex items-center justify-center",
            saved ? "text-accent" : "text-ink",
            pulse && "pulse-heart"
          )}
          aria-label="Toggle bookmark"
        >
          <Bookmark size={17} filled={saved} />
        </button>
      </div>
    </div>
  );
}
