"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles, getMagazines } from "@/lib/store";

export default function DashboardPage() {
  const [counts, setCounts] = useState({ articles: 0, magazines: 0 });

  useEffect(() => {
    setCounts({ articles: getArticles().length, magazines: getMagazines().length });
  }, []);

  const stats = [
    { label: "Total Articles", value: counts.articles, href: "/dashboard/articles", color: "bg-blue-50 text-blue-700" },
    { label: "Total Magazines", value: counts.magazines, href: "/dashboard/magazines", color: "bg-purple-50 text-purple-700" },
  ];

  const quickLinks = [
    { label: "New Article", href: "/dashboard/articles/new", desc: "Create a new article in Malayalam" },
    { label: "New Magazine", href: "/dashboard/magazines/new", desc: "Add a new magazine issue" },
    { label: "Manage Articles", href: "/dashboard/articles", desc: "Edit or delete existing articles" },
    { label: "Manage Magazines", href: "/dashboard/magazines", desc: "Edit or delete magazine issues" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Dashboard</h1>
        <p className="text-[13px] text-gray-500 mt-1">Gulf Sathyadhara Content Management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium ${s.color} mb-3`}>
                {s.label}
              </div>
              <div className="text-[32px] font-bold text-gray-900">{s.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="mb-4 text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</div>
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((q) => (
          <Link key={q.href} href={q.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="text-[14px] font-semibold text-gray-800">{q.label}</div>
              <div className="text-[12px] text-gray-400 mt-1">{q.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
