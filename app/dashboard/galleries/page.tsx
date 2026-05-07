"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticles } from "@/lib/api";
import type { Article } from "@/lib/data";

export default function GalleriesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Article Galleries</h1>
        <p className="text-[13px] text-gray-500 mt-1">Manage image sliders per article</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {articles.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">No articles found</div>
        )}
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3">
            {a.hero && (
              <img src={a.hero} alt={a.title} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-gray-800 truncate font-malayalam" lang="ml">{a.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {counts[a.id] ? `${counts[a.id]} image${counts[a.id] > 1 ? "s" : ""}` : "No images"}
              </div>
            </div>
            <Link
              href={`/dashboard/galleries/edit?articleId=${a.id}`}
              className="text-[12px] text-blue-500 hover:text-blue-700 font-medium flex-shrink-0"
            >
              {counts[a.id] ? "Edit" : "Add images"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
