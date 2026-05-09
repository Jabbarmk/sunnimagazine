"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMagazinesDashboard, deleteMagazine, publishMagazine, getArticles } from "@/lib/api";
import type { Magazine } from "@/lib/data";
import type { Article } from "@/lib/data";

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  const load = () => {
    getMagazinesDashboard().then(setMagazines);
    getArticles().then(setArticles);
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("ഈ ലക്കം ഇല്ലാതാക്കണോ?")) return;
    await deleteMagazine(id); load();
  };

  const handlePublish = async (m: Magazine) => {
    await publishMagazine(m.id, !m.isPublished); load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Magazines</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{magazines.length} issues</p>
        </div>
        <Link href="/dashboard/magazines/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
          + New Issue
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {magazines.map((m) => {
          const articleCount = articles.filter((a) => a.magazineId === m.id).length;
          return (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <img src={m.cover} alt={m.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-malayalam font-semibold text-gray-900 text-[15px]">{m.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                    m.isPublished
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {m.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="text-[12px] text-gray-400 mt-0.5">{m.month} {m.year} · {articleCount} articles</div>
                <div className="font-malayalam text-[12px] text-gray-500 mt-1 line-clamp-1">{m.description}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <button
                  onClick={() => handlePublish(m)}
                  className={`px-3 py-1.5 text-[12px] border rounded-lg transition-colors ${
                    m.isPublished
                      ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {m.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/dashboard/magazines/edit?id=${m.id}`}
                  className="px-3 py-1.5 text-[12px] border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600">
                  Edit
                </Link>
                <button onClick={() => handleDelete(m.id)}
                  className="px-3 py-1.5 text-[12px] border border-red-100 rounded-lg hover:bg-red-50 text-red-500">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
