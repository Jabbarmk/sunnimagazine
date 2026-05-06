"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { logout, isAuthenticated } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "⊞" },
  { href: "/dashboard/articles", label: "Articles", icon: "✦" },
  { href: "/dashboard/magazines", label: "Magazines", icon: "◈" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname.includes("/dashboard/login");

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace("/dashboard/login/");
    }
  }, [isLoginPage]);

  const handleLogout = () => {
    logout();
    router.push("/dashboard/login/");
  };

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-gray-50" style={{ fontFamily: "var(--font-inter)" }}>
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="text-white font-semibold text-[13px] leading-tight">Gulf Sathyadhara</div>
          <div className="text-slate-400 text-[11px] mt-0.5">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="text-[13px] text-gray-400">
            {nav.find((n) =>
              n.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(n.href)
            )?.label ?? "Dashboard"}
          </div>
          <div className="text-[12px] text-gray-500">admin@gulfsathyadhara.com</div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
