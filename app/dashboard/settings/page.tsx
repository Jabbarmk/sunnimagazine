"use client";

import { useState, useEffect } from "react";
import { getEmailSettings, saveEmailSettings, getTicker, saveTicker } from "@/lib/api";
import type { EmailSettings } from "@/lib/store";

const EMPTY: EmailSettings = {
  host: "", port: "587", username: "", password: "", fromName: "", adminEmail: "", whatsappTemplate: "", signupEmailTemplate: "",
};

const DEFAULT_SIGNUP_TEMPLATE =
  "Your registration is successful. About Gulf Sathyadhara Subscription, our sales team will contact you soon.";

const DEFAULT_WA_TEMPLATE =
  "പ്രിയ {name},\n\nതാങ്കളുടെ Gulf Sathyadhara സബ്സ്ക്രിപ്ഷൻ {expiry} ന് അവസാനിക്കുന്നു.\n\nസബ്സ്ക്രിപ്ഷൻ തുക: AED {amount}\n\nദയവായി ഉടൻ പുതുക്കുക.\n\nനന്ദി,\nGulf Sathyadhara Team";

export default function SettingsPage() {
  const [form, setForm] = useState<EmailSettings>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [tickerText, setTickerText] = useState("");
  const [tickerEnabled, setTickerEnabled] = useState(false);
  const [tickerSaved, setTickerSaved] = useState(false);

  useEffect(() => {
    getEmailSettings().then((s) => setForm({ ...EMPTY, ...s }));
    getTicker().then((t) => { setTickerText(t.text); setTickerEnabled(t.isEnabled); });
  }, []);

  const set = (k: keyof EmailSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await saveEmailSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveTicker = async () => {
    await saveTicker({ text: tickerText, isEnabled: tickerEnabled });
    setTickerSaved(true);
    setTimeout(() => setTickerSaved(false), 2500);
  };

  return (
    <div className="max-w-xl space-y-8">
      {/* ── Ticker ───────────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">Running Ticker</h2>
          <p className="text-[13px] text-gray-500 mt-1">Scrolling notification bar shown at the top of the app.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-gray-800">Enable Ticker</div>
              <div className="text-[12px] text-gray-400 mt-0.5">Show the scrolling bar on the app home screen</div>
            </div>
            <button
              onClick={() => setTickerEnabled((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${tickerEnabled ? "bg-amber-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${tickerEnabled ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Ticker Message</label>
            <textarea
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              placeholder="Breaking news or important notice text here…"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-amber-400 resize-y"
            />
          </div>

          {tickerEnabled && tickerText && (
            <div className="rounded-lg overflow-hidden" style={{ background: "#B08A3A" }}>
              <div className="flex items-center gap-0 py-2">
                <span className="px-3 text-[11px] font-bold text-white tracking-wider flex-shrink-0 border-r border-white/30 mr-2">
                  ★ NOTICE
                </span>
                <div className="overflow-hidden flex-1">
                  <span className="ticker-scroll text-[13px] font-medium" style={{ color: "#16161C" }}>
                    {tickerText}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSaveTicker}
              className="px-5 py-2.5 bg-amber-500 text-white rounded-lg text-[13px] font-medium hover:bg-amber-600 transition-colors"
            >
              Save Ticker
            </button>
            {tickerSaved && <span className="text-[12px] text-green-600 font-medium">✓ Saved</span>}
          </div>
        </div>
      </div>

      {/* ── Signup Email Template ──────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">Signup Welcome Email</h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Sent to new users when they register. Use{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">{"{name}"}</code>,{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">{"{email}"}</code>,{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">{"{mobile}"}</code> as placeholders.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <textarea
            value={form.signupEmailTemplate}
            onChange={set("signupEmailTemplate")}
            placeholder={DEFAULT_SIGNUP_TEMPLATE}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y"
          />
          <button
            onClick={() => setForm((f) => ({ ...f, signupEmailTemplate: DEFAULT_SIGNUP_TEMPLATE }))}
            className="text-[12px] text-blue-500 hover:text-blue-700"
          >
            Load default template
          </button>
        </div>
      </div>

      {/* ── WhatsApp Template ──────────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">WhatsApp Notification Template</h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Malayalam message sent via WhatsApp for expiring subscriptions.
            Use <code className="text-[11px] bg-gray-100 px-1 rounded">{"{name}"}</code>,{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">{"{expiry}"}</code>,{" "}
            <code className="text-[11px] bg-gray-100 px-1 rounded">{"{amount}"}</code> as placeholders.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <textarea
            value={form.whatsappTemplate}
            onChange={set("whatsappTemplate")}
            placeholder={DEFAULT_WA_TEMPLATE}
            rows={8}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 resize-y font-malayalam"
            lang="ml"
          />
          <button
            onClick={() => setForm((f) => ({ ...f, whatsappTemplate: DEFAULT_WA_TEMPLATE }))}
            className="text-[12px] text-blue-500 hover:text-blue-700"
          >
            Load default Malayalam template
          </button>
        </div>
      </div>

      {/* ── SMTP ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-[18px] font-semibold text-gray-900">SMTP Settings</h2>
          <p className="text-[13px] text-gray-500 mt-1">Configure outgoing email for receipts and notifications.</p>
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
              <input value={form.password} onChange={set("password")} type={showPass ? "text" : "password"}
                placeholder="App password or SMTP password"
                className="w-full px-3 py-2 pr-16 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono" />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hover:text-gray-600">
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              For Gmail, use an <span className="font-medium">App Password</span> (Google Account → Security → 2-Step Verification → App Passwords).
            </p>
          </div>

          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pt-1">Sender &amp; Recipient</div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">From Name</label>
            <input value={form.fromName} onChange={set("fromName")} placeholder="Gulf Sathyadhara"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Admin Email</label>
            <input value={form.adminEmail} onChange={set("adminEmail")} placeholder="admin@yourmagazine.com" type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 font-mono" />
            <p className="text-[11px] text-gray-400 mt-1">Subscription receipts are CC'd here.</p>
          </div>

          <div className="pt-1 flex items-center gap-3">
            <button onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
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
    </div>
  );
}
