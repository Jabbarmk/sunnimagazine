"use client";

import { useState, useEffect } from "react";
import { getDeletedUsers, deleteAppUser } from "@/lib/api";
import type { AppUser } from "@/lib/store";
import SkeletonRows from "@/app/dashboard/_components/SkeletonRows";

function fmtMonth(val: string): string {
  if (!val) return "";
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [y, m] = val.split("-");
  const idx = parseInt(m) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${y}` : val;
}

export default function DeletedUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try { setUsers(await getDeletedUsers()); }
    finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const handlePermanentDelete = async (u: AppUser) => {
    if (!confirm(`Permanently delete ${u.name}? This cannot be undone.`)) return;
    await deleteAppUser(u.id);
    reload();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard/users" className="text-gray-400 hover:text-gray-600 text-[20px]">←</a>
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900">Deleted Users</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{loading ? "Loading…" : `${users.length} deleted accounts`}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-[13px] text-amber-700">
        These users have been soft-deleted. Their data is retained for records. You can permanently remove them here.
      </div>

      {loading ? (
        <SkeletonRows count={3} hasImage />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-12 text-center text-[13px] text-gray-400">
          No deleted users.
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-200 flex items-center gap-3 p-3 opacity-80">
              {u.photo ? (
                <img src={u.photo} alt={u.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-gray-100 grayscale" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-[15px] font-semibold border border-gray-300">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-gray-700 line-through">{u.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Deleted</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 truncate">{u.email}</div>
                <div className="flex gap-3 mt-0.5 flex-wrap">
                  {u.mobile && <span className="text-[11px] text-gray-400">{u.mobile}</span>}
                  {u.location && <span className="text-[11px] text-gray-400">{u.location}</span>}
                </div>
                {(u.subscriptionFrom || u.subscriptionTo) && (
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Sub: {fmtMonth(u.subscriptionFrom)} – {fmtMonth(u.subscriptionTo)}
                  </div>
                )}
                {u.deletedAt && (
                  <div className="text-[10px] text-red-400 mt-0.5">
                    Deleted: {new Date(u.deletedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
              <button
                onClick={() => handlePermanentDelete(u)}
                className="text-[12px] text-red-400 hover:text-red-600 flex-shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
