"use client";

import { useState, useEffect } from "react";
import { getEmailSettings, saveEmailSettings } from "@/lib/api";
import type { EmailSettings } from "@/lib/store";

const EMPTY: EmailSettings = {
  host: "",
  port: "587",
  username: "",
  password: "",
  fromName: "",
  adminEmail: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState<EmailSettings>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { getEmailSettings().then((s) => setForm({ ...EMPTY, ...s })); }, []);

  const set = (k: keyof EmailSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await saveEmailSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">SMTP Settings</h1>
        <p className="text-[13px] text-gray-500 mt-1">Configure outgoing email for user writing submissions.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Server</div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">SMTP Host</label>
            <input value={form.host} onChange={set("host")} placeholder="smtp.gmail.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono" />
          </div>
          <div className="w-24">
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Port</label>
            <input value={form.port} onChange={set("port")} placeholder="587"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono" />
          </div>
        </div>

        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pt-1">Authentication</div>

        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Username</label>
          <input value={form.username} onChange={set("username")} placeholder="you@gmail.com" type="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              value={form.password}
              onChange={set("password")}
              type={showPass ? "text" : "password"}
              placeholder="App password or SMTP password"
              className="w-full px-3 py-2 pr-16 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hover:text-gray-600"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            For Gmail, use an <span className="font-medium">App Password</span> (Google Account → Security → 2-Step Verification → App Passwords).
          </p>
        </div>

        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pt-1">Sender & Recipient</div>

        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">From Name</label>
          <input value={form.fromName} onChange={set("fromName")} placeholder="Gulf Sathyadhara"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Admin Email</label>
          <input value={form.adminEmail} onChange={set("adminEmail")} placeholder="admin@yourmagazine.com" type="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono" />
          <p className="text-[11px] text-gray-400 mt-1">New submission notifications are sent here.</p>
        </div>

        <div className="pt-1 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
          {saved && <span className="text-[12px] text-green-600 font-medium">✓ Saved</span>}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-[12px] text-amber-700">
        <strong>Common SMTP hosts:</strong>
        <div className="mt-1.5 space-y-0.5 font-mono text-[11px]">
          <div>Gmail — smtp.gmail.com : 587</div>
          <div>Outlook — smtp.office365.com : 587</div>
          <div>Yahoo — smtp.mail.yahoo.com : 587</div>
          <div>cPanel/Hosting — mail.yourdomain.com : 587</div>
        </div>
      </div>
    </div>
  );
}
