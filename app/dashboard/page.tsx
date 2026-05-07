"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles, getMagazines, getCategories } from "@/lib/api";

const FileTextIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const BookIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const TagIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function DashboardPage() {
  const [counts, setCounts] = useState({ articles: 0, magazines: 0, categories: 0 });

  useEffect(() => {
    Promise.all([getArticles(), getMagazines(), getCategories()]).then(([a, m, c]) => {
      setCounts({ articles: a.length, magazines: m.length, categories: c.length });
    });
  }, []);

  const stats = [
    {
      label: "Total Articles",
      value: counts.articles,
      href: "/dashboard/articles",
      Icon: FileTextIcon,
      accent: "#E85A4F",
      bg: "rgba(232,90,79,0.08)",
    },
    {
      label: "Total Magazines",
      value: counts.magazines,
      href: "/dashboard/magazines",
      Icon: BookIcon,
      accent: "#B08A3A",
      bg: "rgba(176,138,58,0.08)",
    },
    {
      label: "Categories",
      value: counts.categories,
      href: "/dashboard/categories",
      Icon: TagIcon,
      accent: "#4F7BE8",
      bg: "rgba(79,123,232,0.08)",
    },
  ];

  const quickLinks = [
    {
      label: "New Article",
      desc: "Create a new article in Malayalam",
      href: "/dashboard/articles/new",
      accent: "#E85A4F",
      isNew: true,
    },
    {
      label: "New Magazine",
      desc: "Add a new magazine issue",
      href: "/dashboard/magazines/new",
      accent: "#B08A3A",
      isNew: true,
    },
    {
      label: "Manage Articles",
      desc: "Edit or delete existing articles",
      href: "/dashboard/articles",
      accent: "#6B6B70",
      isNew: false,
    },
    {
      label: "Manage Magazines",
      desc: "Edit or delete magazine issues",
      href: "/dashboard/magazines",
      accent: "#6B6B70",
      isNew: false,
    },
  ];

  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[30px] font-bold text-[#141416] leading-tight">Welcome back</h1>
        <p className="text-[15px] text-[#6B6B70] mt-1">Gulf Sathyadhara Content Management System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {stats.map(({ label, value, href, Icon, accent, bg }) => (
          <Link key={label} href={href}>
            <div
              className="bg-white rounded-2xl p-6 transition-all duration-200 cursor-pointer group"
              style={{ boxShadow: "0 4px 20px rgba(20,20,22,0.06)", border: "1px solid #E8E6DF" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 40px rgba(20,20,22,0.12)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(20,20,22,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg, color: accent }}>
                  <Icon />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>
                  <ArrowRightIcon />
                </div>
              </div>
              <div className="text-[38px] font-bold text-[#141416] leading-none mb-1">{value}</div>
              <div className="text-[14px] font-medium text-[#6B6B70]">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <span className="text-[11px] font-bold text-[#9A9A9E] uppercase tracking-widest">Quick Actions</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map(({ label, desc, href, accent, isNew }) => (
          <Link key={href} href={href}>
            <div
              className="bg-white rounded-2xl p-5 transition-all duration-200 cursor-pointer group flex items-center gap-4"
              style={{ boxShadow: "0 4px 20px rgba(20,20,22,0.06)", border: "1px solid #E8E6DF" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 40px rgba(20,20,22,0.12)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.borderColor = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(20,20,22,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.borderColor = "#E8E6DF";
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isNew ? accent : "#F2F1EC", color: isNew ? "#fff" : accent }}>
                <PlusIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-[#141416]">{label}</div>
                <div className="text-[13px] text-[#9A9A9E] mt-0.5 truncate">{desc}</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9A9A9E]">
                <ArrowRightIcon />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
