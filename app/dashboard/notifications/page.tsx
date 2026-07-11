"use client";

import { useState } from "react";
import { sendNotification } from "@/lib/api";
import { EMIRATES } from "@/lib/emirates";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
      await sendNotification({ title: title.trim(), body: body.trim(), target });
      setMsg({ type: "ok", text: `Sent to ${audience}.` });
      setTitle(""); setBody("");
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to send." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">Notifications</h1>
        <p className="text-[13px] text-gray-500 mt-1">Send a push notification to the mobile app.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
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

      <p className="text-[12px] text-gray-400 mt-4 leading-relaxed">
        Publishing a magazine, or adding news / events, also sends an automatic notification
        (news &amp; events go to their emirate; magazines go to everyone). Requires the Firebase
        service account to be configured on the server.
      </p>
    </div>
  );
}
