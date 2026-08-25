"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getPendingUsers, approveUser, toggleUserActive, getEmailSettings } from "@/lib/api";
import { fmtDate } from "@/lib/subscription";
import type { EmailSettings } from "@/lib/store";

export type PendingUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  whatsapp: string;
  code: string;
  location: string;
  emirates: string;
  referredBy: string;
  referralMobile: string;
  hasPassword: boolean;
  createdAt: string | null;
};

type ApproveResult = {
  generatedPassword: string | null;
  emailMsg: string;
};

function ApproveModal({ user, emailSettings, onDone, onClose }: {
  user: PendingUser;
  emailSettings: EmailSettings | null;
  onDone: (userId: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    amountAed: "",
    fromMonth: "",
    toMonth: "",
    paidDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApproveResult | null>(null);

  const handleApprove = async () => {
    if (!form.amountAed || !form.fromMonth || !form.toMonth) {
      setError("Amount, From and To are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await approveUser({
        userId: user.id,
        amountAed: parseFloat(form.amountAed),
        fromMonth: form.fromMonth,
        toMonth: form.toMonth,
        paidDate: form.paidDate,
      });

      // Emails are sent server-side by the approve API; it reports what went out.
      const em = res.emails;
      let emailMsg: string;
      if (em?.receiptSent && em?.credentialsSent) {
        emailMsg = `Receipt and login details emailed to ${user.email}.`;
      } else if (em?.receiptSent || em?.credentialsSent) {
        emailMsg = `Approved, but only the ${em.receiptSent ? "receipt" : "login details"} email was sent (${em.error || "other email failed"}).`;
      } else {
        emailMsg = `Approved. No emails sent${em?.error ? ` (${em.error})` : ""}.`;
      }

      setResult({ generatedPassword: res.generatedPassword, emailMsg });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {result ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-[22px] mb-3">✓</div>
            <h2 className="text-[17px] font-semibold text-gray-900 mb-1">{user.name} approved</h2>
            <p className="text-[13px] text-gray-500 mb-4">{result.emailMsg}</p>
            {result.generatedPassword && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Generated password</div>
                <div className="text-[20px] font-mono font-bold text-gray-900 tracking-widest">{result.generatedPassword}</div>
                <p className="text-[11px] text-amber-700 mt-2">
                  Shown only once — copy it now if you need to share it via WhatsApp.
                </p>
              </div>
            )}
            <button
              onClick={() => onDone(user.id)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="text-[17px] font-semibold text-gray-900 mb-0.5">Approve &amp; Add Subscription</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              {user.name} · {user.mobile || user.email}
              {!user.hasPassword && (
                <span className="ml-2 text-[11px] text-amber-600 font-medium">A login password will be generated</span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Amount (AED) <span className="text-red-400">*</span></label>
                <input type="number" min="0" value={form.amountAed}
                  onChange={(e) => { setForm((f) => ({ ...f, amountAed: e.target.value })); setError(""); }}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Paid Date</label>
                <input type="date" value={form.paidDate}
                  onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">From <span className="text-red-400">*</span></label>
                <input type="date" value={form.fromMonth}
                  onChange={(e) => { setForm((f) => ({ ...f, fromMonth: e.target.value })); setError(""); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">To <span className="text-red-400">*</span></label>
                <input type="date" value={form.toMonth}
                  onChange={(e) => { setForm((f) => ({ ...f, toMonth: e.target.value })); setError(""); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
              </div>
            </div>

            {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

            <div className="flex gap-2 items-center">
              <button onClick={handleApprove} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Approving…" : "Approve & Save"}
              </button>
              <button onClick={onClose} disabled={saving}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
                Cancel
              </button>
              {emailSettings?.host && user.email && (
                <span className="text-[11px] text-gray-400">Receipt &amp; login details will be emailed</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ApprovalsList({ limit, showViewAll, onCountChange }: {
  limit?: number;
  showViewAll?: boolean;
  onCountChange?: (count: number) => void;
}) {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [approving, setApproving] = useState<PendingUser | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPendingUsers();
      setUsers(list);
      onCountChange?.(list.length);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    reload();
    getEmailSettings().then(setEmailSettings).catch(() => {});
  }, [reload]);

  const removeFromList = (id: string) => {
    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id);
      onCountChange?.(next.length);
      return next;
    });
  };

  const handleReject = async (u: PendingUser) => {
    if (!confirm(`Reject ${u.name}? Their account will be deactivated — they won't be able to log in.`)) return;
    setRejecting(u.id);
    try {
      await toggleUserActive(u.id, false);
      removeFromList(u.id);
    } catch {
      alert("Failed to reject. Please try again.");
    } finally {
      setRejecting(null);
    }
  };

  const visible = limit ? users.slice(0, limit) : users;

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E6DF] p-4 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E6DF] p-8 text-center">
        <div className="text-[28px] mb-2">🎉</div>
        <p className="text-[14px] font-medium text-gray-700">No pending registrations</p>
        <p className="text-[12px] text-gray-400 mt-1">New app signups without a subscription will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((u) => (
        <div key={u.id} className="bg-white rounded-2xl border border-[#E8E6DF] p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0" style={{ background: "#B08A3A" }}>
            {(u.name?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold text-gray-900">{u.name}</span>
              {u.emirates && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{u.emirates}</span>
              )}
              {!u.hasPassword && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">No password yet</span>
              )}
            </div>
            <div className="text-[12px] text-gray-500 mt-0.5 truncate">
              {u.email}
              {u.mobile && <> · {u.mobile}</>}
              {u.createdAt && <> · Registered {fmtDate(u.createdAt)}</>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setApproving(u)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-[12px] font-medium hover:bg-blue-700"
            >
              Approve &amp; Add Subscription
            </button>
            <button
              onClick={() => handleReject(u)}
              disabled={rejecting === u.id}
              className="px-3 py-2 border border-gray-200 text-red-500 rounded-lg text-[12px] font-medium hover:bg-red-50 disabled:opacity-50"
            >
              {rejecting === u.id ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      ))}

      {showViewAll && limit !== undefined && users.length > limit && (
        <Link
          href="/dashboard/approvals"
          className="block text-center py-2.5 text-[13px] font-medium rounded-xl border border-[#E8E6DF] bg-white hover:bg-gray-50 transition-colors"
          style={{ color: "#B08A3A" }}
        >
          View all {users.length} pending registrations →
        </Link>
      )}

      {approving && (
        <ApproveModal
          user={approving}
          emailSettings={emailSettings}
          onDone={(id) => { removeFromList(id); setApproving(null); }}
          onClose={() => setApproving(null)}
        />
      )}
    </div>
  );
}
