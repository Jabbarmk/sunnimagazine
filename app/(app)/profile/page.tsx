"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/lib/bookmarks";
import { LogoBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { getAppUser, clearAppUser, skipLogin, type StoredUser } from "@/lib/auth";

function daysLeft(to: string): number {
  return Math.ceil((new Date(to).getTime() - Date.now()) / 86_400_000);
}

function subStatus(to: string) {
  if (!to) return "none";
  const d = daysLeft(to);
  if (d < 0) return "expired";
  if (d <= 30) return "expiring";
  return "active";
}

const SUB_COLORS = {
  active:   { badge: "bg-green-50 text-green-700 border border-green-200", label: "Active" },
  expiring: { badge: "bg-amber-50 text-amber-700 border border-amber-200", label: "Expiring Soon" },
  expired:  { badge: "bg-red-50 text-red-600 border border-red-200",       label: "Expired" },
  none:     { badge: "bg-gray-100 text-gray-500 border border-gray-200",   label: "No Subscription" },
};

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between px-4 py-3 border-b border-line last:border-0">
      <span className="text-[12px] text-muted flex-shrink-0 w-32">{label}</span>
      <span className="text-[13px] text-ink font-medium text-right flex-1">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { ids } = useBookmarks();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getAppUser());
  }, []);

  const handleLogout = () => {
    clearAppUser();
    router.push("/login");
  };

  // ── Guest view ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
          <LogoBar />
          <div className="flex flex-col items-center mt-10 px-5">
            <div className="w-20 h-20 rounded-full bg-surface shadow-card flex items-center justify-center text-[32px] text-muted mb-4">
              👤
            </div>
            <p className="font-serif text-[18px] text-ink">You're not signed in</p>
            <p className="text-[13px] text-muted mt-1 text-center">Sign in to view your subscription and profile details.</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 px-8 py-3 rounded-2xl bg-ink text-bg text-[14px] font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  // ── Logged-in view ──────────────────────────────────────────────────────────
  const st = subStatus(user.subscriptionTo);
  const stMeta = SUB_COLORS[st];
  const dl = user.subscriptionTo ? daysLeft(user.subscriptionTo) : null;

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <LogoBar />

        {/* Avatar + name */}
        <div className="flex flex-col items-center mt-4 px-5">
          {user.photo ? (
            <div className="w-[96px] h-[96px] rounded-full p-[3px] bg-gradient-to-br from-gold to-gold/40">
              <img src={user.photo} alt={user.name}
                className="w-full h-full rounded-full object-cover border-[3px] border-bg" />
            </div>
          ) : (
            <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-gold to-gold/40 flex items-center justify-center text-[36px] font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="font-serif text-[20px] text-ink mt-3">{user.name}</div>
          <div className={`text-[10px] px-3 py-1 rounded-full font-medium mt-1.5 ${stMeta.badge}`}>
            {stMeta.label}
          </div>
        </div>

        {/* Saved count */}
        <div className="mx-5 mt-5 p-4 rounded-2xl bg-surface shadow-card flex items-center justify-center">
          <div className="text-center">
            <div className="font-serif text-[22px] text-ink leading-none">{ids.length}</div>
            <div className="text-[11px] text-muted mt-1.5">Saved Articles</div>
          </div>
        </div>

        {/* Account details */}
        <div className="mx-5 mt-4 rounded-2xl bg-surface shadow-card overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">Account</span>
          </div>
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Mobile" value={user.mobile} />
          <Row label="Location" value={user.location} />
        </div>

        {/* Subscription details */}
        <div className="mx-5 mt-4 rounded-2xl bg-surface shadow-card overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">Subscription</span>
          </div>
          <Row label="Status" value={stMeta.label} />
          <Row label="From" value={user.subscriptionFrom} />
          <Row label="Expiry" value={user.subscriptionTo} />
          {dl !== null && st === "active" && (
            <Row label="Days Left" value={`${dl} days`} />
          )}
          {dl !== null && st === "expiring" && (
            <Row label="Days Left" value={`${dl} days — renew soon`} />
          )}
          {dl !== null && st === "expired" && (
            <Row label="Expired" value={`${Math.abs(dl)} days ago`} />
          )}
        </div>

        {/* Referral details */}
        {(user.referredBy || user.referralMobile) && (
          <div className="mx-5 mt-4 rounded-2xl bg-surface shadow-card overflow-hidden">
            <div className="px-4 pt-3 pb-2">
              <span className="text-[10px] font-semibold text-gold uppercase tracking-wider">Referral</span>
            </div>
            <Row label="Referred By" value={user.referredBy} />
            <Row label="Referral Mobile" value={user.referralMobile} />
          </div>
        )}

        {/* Sign out */}
        <div className="mx-5 mt-4 mb-6 rounded-2xl bg-surface shadow-card overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3.5 text-left text-[14px] text-accent"
          >
            Sign Out
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
