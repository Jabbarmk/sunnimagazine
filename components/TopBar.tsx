"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Share, Bookmark, User, X, ChevronRight } from "./Icons";
import { useBookmarks } from "@/lib/bookmarks";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

function ProfileSheet({ onClose }: { onClose: () => void }) {
  const { ids } = useBookmarks();
  const stats = [
    { label: "Saved", value: ids.length },
    { label: "Read", value: 48 },
    { label: "Issues", value: 6 },
  ];
  const settings: { label: string; danger?: boolean }[] = [
    { label: "My Subscription" },
    { label: "Notifications" },
    { label: "Help & Support" },
    { label: "Privacy Policy" },
    { label: "Log Out", danger: true },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pt-5 pb-3 flex-shrink-0">
        <div className="font-serif text-[18px] text-ink">Profile</div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Avatar */}
        <div className="flex flex-col items-center pt-3 pb-4 px-5">
          <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-gold to-gold/40">
            <img
              src="https://picsum.photos/seed/profile-avatar/160/160"
              alt=""
              className="w-full h-full rounded-full object-cover border-[2px] border-bg"
            />
          </div>
          <div className="font-serif text-[19px] text-ink mt-2.5">Aisha Mendez</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-gold mt-0.5">Premium Member</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mx-5 mb-4 p-3 rounded-2xl bg-surface shadow-card">
          {stats.map((s) => (
            <div key={s.label} className="text-center py-1">
              <div className="font-serif text-[20px] text-ink leading-none">{s.value}</div>
              <div className="text-[10px] text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="mx-5 mb-8 rounded-2xl bg-surface shadow-card overflow-hidden">
          {settings.map((s, i) => (
            <button
              key={s.label}
              className={`w-full flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <span className={`text-[13px] ${s.danger ? "text-accent" : "text-ink"}`}>{s.label}</span>
              {!s.danger && <span className="text-muted"><ChevronRight size={14} /></span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LogoBar() {
  return (
    <div className="pt-5 pb-3">
      <div className="relative flex items-center justify-center">
        <img src="/logo.png" alt="Gulf Sathyadhara" className="w-[60%] h-auto object-contain" />
        <Link
          href="/profile"
          aria-label="Profile"
          className="absolute right-5 w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
        >
          <User size={18} />
        </Link>
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
    if (!saved) { setPulse(true); setTimeout(() => setPulse(false), 500); }
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
