"use client";

import { useState, useEffect } from "react";
import { getUserWritings, updateUserWritingStatus, deleteUserWriting } from "@/lib/api";
import type { UserWriting } from "@/lib/store";

const STATUS_LABELS: Record<UserWriting["status"], string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  published: "Published",
};

const STATUS_COLORS: Record<UserWriting["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  published: "bg-green-50 text-green-700 border-green-200",
};

export default function UserWritingsPage() {
  const [writings, setWritings] = useState<UserWriting[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const reload = () => { getUserWritings().then(setWritings); };
  useEffect(reload, []);

  const handleStatus = async (w: UserWriting, status: UserWriting["status"]) => {
    await updateUserWritingStatus(w.id, status);
    reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await deleteUserWriting(id);
    reload();
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">User Writings</h1>
        <p className="text-[13px] text-gray-500 mt-1">{writings.length} submissions</p>
      </div>

      {writings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-[13px] text-gray-400">
          No submissions yet.
        </div>
      ) : (
        <div className="space-y-3">
          {writings.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-gray-800">{w.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[w.status]}`}>
                      {STATUS_LABELS[w.status]}
                    </span>
                    {w.artCategoryName && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {w.artCategoryName}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {w.email} · {new Date(w.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                  className="text-[12px] text-gray-400 hover:text-gray-700 flex-shrink-0"
                >
                  {expanded === w.id ? "Collapse" : "View"}
                </button>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-[12px] text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  Delete
                </button>
              </div>

              {expanded === w.id && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">{w.description}</p>
                  {w.image && (
                    <img src={w.image} alt="" className="max-w-xs rounded-lg border border-gray-200 object-cover" />
                  )}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-gray-500 mr-2 self-center">Change status:</span>
                    {(["pending", "reviewed", "published"] as UserWriting["status"][]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatus(w, s)}
                        className={`px-3 py-1 rounded-lg text-[11px] border font-medium transition-colors ${
                          w.status === s ? STATUS_COLORS[s] : "text-gray-400 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
