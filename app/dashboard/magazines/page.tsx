"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMagazines, deleteMagazine, getArticles } from "@/lib/store";
import type { Magazine } from "@/lib/data";

export default function MagazinesPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);

  const load = () => setMagazines(getMagazines());
  useEffect(() => { load(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm("ഈ ലക്കം ഇല്ലാതാക്കണോ?")) return;
    deleteMagazine(id);
    load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Magazines</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{magazines.length} issues</p>
        </div>
        <Link
          href="/dashboard/magazines/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
        >
          + New Issue
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {magazines.map((m) => {
          const articleCount = getArticles().filter((a) => a.magazineId === m.id).length;
          return (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <img
                src={m.cover}
                alt={m.title}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-malayalam font-semibold text-gray-900 text-[15px]">{m.title}</div>
                <div className="text-[12px] text-gray-400 mt-0.5">{m.month} {m.year} · {articleCount} articles</div>
                <div className="font-malayalam text-[12px] text-gray-500 mt-1 line-clamp-1">{m.description}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/magazines/${m.id}/edit`}
                  className="px-3 py-1.5 text-[12px] border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="px-3 py-1.5 text-[12px] border border-red-100 rounded-lg hover:bg-red-50 text-red-500"
                >
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
