"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getArticlesList, getMagazinesDashboard, deleteArticle } from "@/lib/api";
import type { Article } from "@/lib/data";
import type { Magazine } from "@/lib/data";

function ArticlesList() {
  const searchParams = useSearchParams();
  const magazineParam = searchParams.get("magazine");
  const [articles, setArticles] = useState<Article[]>([]);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  // null = not initialised yet; "" = All magazines
  const [magazineId, setMagazineId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = (mag: string | null) => {
    if (mag === null) return;
    getArticlesList(mag || undefined).then(setArticles);
  };

  useEffect(() => {
    getMagazinesDashboard().then((mags) => {
      setMagazines(mags);
      // Default selection: magazine from the URL (e.g. opened from Magazines page),
      // otherwise the latest magazine (list is sorted newest first).
      setMagazineId((prev) => prev ?? (magazineParam || mags[0]?.id || ""));
    });
  }, [magazineParam]);

  // Fetch only the selected magazine's articles (light list) from the server.
  useEffect(() => { load(magazineId); }, [magazineId]);

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMagazine = magazines.find((m) => m.id === magazineId);

  const handleDelete = async (id: string) => {
    if (!confirm("ഈ ലേഖനം ഇല്ലാതാക്കണോ?")) return;
    await deleteArticle(id);
    load(magazineId);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Articles</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {selectedMagazine
              ? `${articles.length} articles in ${selectedMagazine.title}`
              : `${articles.length} articles`}
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
        >
          + New Article
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={magazineId ?? ""}
          onChange={(e) => setMagazineId(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white"
        >
          <option value="">All magazines</option>
          {magazines.map((m) => (
            <option key={m.id} value={m.id}>{m.title} ({m.month} {m.year})</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="flex-1 min-w-[180px] max-w-sm px-4 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Author</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No articles found.
                </td>
              </tr>
            )}
            {filtered.map((a, i) => (
              <tr key={a.id} className={`${i > 0 ? "border-t border-gray-100" : ""} hover:bg-gray-50`}>
                <td className="px-4 py-3">
                  <div className="font-malayalam text-gray-900 line-clamp-1 max-w-[220px]">{a.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{a.id}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-malayalam inline-block px-2 py-0.5 bg-gold/10 text-gold rounded text-[11px]">
                    {a.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{a.author}</td>
                <td className="px-4 py-3 text-gray-400">{a.date}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/dashboard/articles/edit?id=${a.id}`}
                      className="px-3 py-1 text-[12px] border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="px-3 py-1 text-[12px] border border-red-100 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-[13px]">Loading…</div>}>
      <ArticlesList />
    </Suspense>
  );
}
