"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, Film, Book, Bookmark, User } from "./Icons";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/videos", label: "Videos", icon: Film, match: (p: string) => p.startsWith("/videos") },
  { href: "/archive", label: "Magazine", icon: Book, match: (p: string) => p.startsWith("/archive") || p.startsWith("/magazine") },
  { href: "/bookmarks", label: "Saved", icon: Bookmark, match: (p: string) => p.startsWith("/bookmarks") },
  { href: "/profile", label: "Me", icon: User, match: (p: string) => p.startsWith("/profile") },
];

export default function BottomNav() {
  const pathname = usePathname() || "/";
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-20 bg-surface/95 backdrop-blur border-t border-line">
      <div className="flex items-center justify-around px-2 py-2 pb-3">
        {tabs.map((t) => {
          const active = t.match(pathname);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5"
            >
              <div
                className={clsx(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                  active ? "bg-ink text-bg" : "text-muted"
                )}
              >
                <Icon size={20} />
              </div>
              <span
                className={clsx(
                  "text-[10px] tracking-wide",
                  active ? "text-ink font-medium" : "text-muted"
                )}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
