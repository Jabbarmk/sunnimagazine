"use client";

import { useBookmarks } from "@/lib/bookmarks";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "@/components/Icons";

const settings: { label: string; danger?: boolean }[] = [
  { label: "My Subscription" },
  { label: "Notifications" },
  { label: "Reading Preferences" },
  { label: "Language" },
  { label: "Help & Support" },
  { label: "Privacy Policy" },
  { label: "Log Out", danger: true },
];

export default function ProfilePage() {
  const { ids } = useBookmarks();
  const stats = [
    { label: "Saved", value: ids.length },
    { label: "Read", value: 48 },
    { label: "Issues", value: 6 },
  ];

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 md:pb-0">
        <LogoBar />
        <div className="flex flex-col items-center mt-4 px-5">
          <div className="w-[96px] h-[96px] rounded-full p-[3px] bg-gradient-to-br from-gold to-gold/40">
            <img
              src="https://picsum.photos/seed/profile-avatar/240/240"
              alt=""
              className="w-full h-full rounded-full object-cover border-[3px] border-bg"
            />
          </div>
          <div className="font-serif text-[20px] text-ink mt-3">Aisha Mendez</div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-gold mt-1">Premium Member</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mx-5 mt-6 p-4 rounded-2xl bg-surface shadow-card">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-[22px] text-ink leading-none">{s.value}</div>
              <div className="text-[11px] text-muted mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mx-5 mt-5 mb-6 rounded-2xl bg-surface shadow-card overflow-hidden">
          {settings.map((s, i) => (
            <button
              key={s.label}
              className={`w-full flex items-center justify-between px-4 py-3.5 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <span className={`text-[14px] ${s.danger ? "text-accent" : "text-ink"}`}>
                {s.label}
              </span>
              {!s.danger && (
                <span className="text-muted">
                  <ChevronRight size={15} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
