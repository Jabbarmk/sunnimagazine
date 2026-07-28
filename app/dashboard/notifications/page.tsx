"use client";

import { useState, useEffect } from "react";
import { sendNotification, getNotificationHistory } from "@/lib/api";
import { EMIRATES } from "@/lib/emirates";
import RowActionButton from "@/app/dashboard/_components/RowActionButton";

type HistoryItem = {
  id: string; title: string; body: string; target: string; type: string;
  status: string; recipientCount: number | null; createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  sent: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-600 border-red-200",
  skipped: "bg-gray-100 text-gray-500 border-gray-200",
};

const TYPE_LABEL: Record<string, string> = {
  manual: "Manual",
  magazine: "Magazine",
  news: "News",
  event: "Event",
  expired: "Expired Reminder",
  expiring: "Expiring Reminder",
};

function fmtDateTime(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = () => {
    setLoadingHistory(true);
    getNotificationHistory().then(setHistory).finally(() => setLoadingHistory(false));
  };
  useEffect(() => { loadHistory(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setMsg({ type: "err", text: "Title and message are required." });
      return;
    }
    const audience = target === "all" ? "all users" : target;
    if (!confirm(`Send this push notification to ${audience}?`)) return;
    setSending(true);
    setMsg(null);
    try {
      await sendNotification({ title: title.trim(), body: body.trim(), target, type: "manual" });
      setMsg({ type: "ok", text: `Sent to ${audience}.` });
      setTitle(""); setBody("");
      loadHistory();
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to send." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Notification Master</h1>
        <p className="text-[13px] text-gray-500 mt-1">Compose &amp; send push notifications, and review send history.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 mb-6">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Compose</div>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Audience</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
            <option value="all">All users</option>
            {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
          <input value={title} onChange={(e) => { setTitle(e.target.value); setMsg(null); }}
            placeholder="Notification title" maxLength={80}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Message <span className="text-red-400">*</span></label>
          <textarea value={body} onChange={(e) => { setBody(e.target.value); setMsg(null); }}
            placeholder="What do you want to say?" rows={4} maxLength={240}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y" />
          <p className="text-[11px] text-gray-400 mt-1">{body.length}/240</p>
        </div>

        {msg && (
          <p className={`text-[13px] px-3 py-2 rounded-lg ${msg.type === "ok" ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
            {msg.text}
          </p>
        )}

        <button onClick={handleSend} disabled={sending}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
          {sending ? "Sending…" : "Send Notification"}
        </button>
      </div>

      <p className="text-[12px] text-gray-400 mb-4 leading-relaxed">
        News &amp; events also auto-send to their emirate when added. Magazines don&apos;t auto-send —
        use the <b>Notify</b> button on the Magazines page after publishing. Expired/expiring
        subscription reminders are sent from the Users page. Requires the Firebase service account
        to be configured on the server.
      </p>

      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Send History</div>
        <RowActionButton onClick={loadHistory}>Refresh</RowActionButton>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Title / Message</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Audience</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {loadingHistory && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loadingHistory && history.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No notifications sent yet.</td></tr>
            )}
            {history.map((h, i) => (
              <tr key={h.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 line-clamp-1 max-w-[280px]">{h.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 max-w-[280px]">{h.body}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{TYPE_LABEL[h.type] ?? h.type}</td>
                <td className="px-4 py-3 text-gray-600">
                  {h.target}
                  {h.recipientCount != null && <span className="text-gray-400"> · {h.recipientCount} sent</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[h.status] ?? STATUS_STYLE.skipped}`}>
                    {h.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{fmtDateTime(h.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
