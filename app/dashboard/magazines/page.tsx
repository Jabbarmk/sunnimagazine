"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMagazinesList, magazineCoverUrl, deleteMagazine, publishMagazine, sendNotification } from "@/lib/api";
import { Book } from "@/components/Icons";
import type { Magazine } from "@/lib/data";
import { EMIRATES } from "@/lib/emirates";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";

function NotifyMagazinePanel({ magazine, onClose }: { magazine: Magazine; onClose: () => void }) {
  const [title, setTitle] = useState("New Issue Published");
  const [body, setBody] = useState(magazine.title || "");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setMsg({ type: "err", text: "Title and message are required." });
      return;
    }
    const audience = target === "all" ? "all users" : target;
    if (!confirm(`Send this push to ${audience}?`)) return;
    setSending(true);
    setMsg(null);
    try {
      await sendNotification({ title: title.trim(), body: body.trim(), target, type: "magazine" });
      setMsg({ type: "ok", text: `Sent to ${audience}.` });
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to send." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Notify Users</div>
        <button onClick={onClose} className="text-[12px] text-gray-400 hover:text-gray-600">✕ Close</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Audience</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
            <option value="all">All users</option>
            {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Message</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y" />
      </div>
      {msg && (
        <p className={`text-[13px] px-3 py-2 rounded-lg ${msg.type === "ok" ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
          {msg.text}
        </p>
      )}
      <button onClick={handleSend} disabled={sending}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
        {sending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}

export default function MagazinesPage() {
  // Light list: articleCount + hasCover, no base64 covers. Covers lazy-load per magazine.
  const [magazines, setMagazines] = useState<(Magazine & { articleCount?: number; hasCover?: boolean })[]>([]);
  const [notifyId, setNotifyId] = useState<string | null>(null);

  const load = () => {
    getMagazinesList().then(setMagazines);
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
          const articleCount = m.articleCount ?? 0;
          return (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                {m.hasCover
                  ? <img src={magazineCoverUrl(m.id)} alt={m.title} loading="lazy" className="w-12 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                  : <div className="w-12 h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400"><Book size={20} /></div>
                }
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
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  <RowActionButton variant="primary" href={`/dashboard/articles?magazine=${m.id}`}>
                    View Articles
                  </RowActionButton>
                  <RowActionButton
                    variant={m.isPublished ? "warning" : "success"}
                    onClick={() => handlePublish(m)}
                  >
                    {m.isPublished ? "Unpublish" : "Publish"}
                  </RowActionButton>
                  <RowActionButton
                    variant="primary"
                    onClick={() => setNotifyId(notifyId === m.id ? null : m.id)}
                  >
                    🔔 Notify
                  </RowActionButton>
                  <RowActionButton href={`/dashboard/magazines/edit?id=${m.id}`}>Edit</RowActionButton>
                  <RowActionButton variant="danger" onClick={() => handleDelete(m.id)}>Delete</RowActionButton>
                </div>
              </div>
              {notifyId === m.id && (
                <NotifyMagazinePanel magazine={m} onClose={() => setNotifyId(null)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
