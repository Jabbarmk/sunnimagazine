"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getEmailSettings } from "@/lib/api";
import { sendSignupEmails } from "@/lib/email";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
    setServerError("");
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/app-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), mobile: form.mobile.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data?.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      try {
        const settings = await getEmailSettings();
        await sendSignupEmails(settings, form.name.trim(), form.email.trim(), form.mobile.trim());
      } catch { /* email failure doesn't block signup success */ }

      setDone(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const inp = (k: string) =>
    `w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border transition-colors ${
      errors[k] ? "border-accent" : "border-transparent focus:border-gold/50"
    }`;

  if (done) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-bg">
        <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center text-[30px] mb-4">✓</div>
        <h2 className="font-serif text-[22px] text-ink mb-2">Registration Successful!</h2>
        <p className="text-[13px] text-muted text-center leading-relaxed mb-8">
          About Gulf Sathyadhara Subscription, our sales team will contact you soon.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-8 py-3 rounded-xl bg-ink text-bg text-[14px] font-semibold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-8 py-4">
        <img src="/logo.png" alt="Gulf Sathyadhara" className="w-[40%] h-auto object-contain mb-6 mx-auto" />

        <h1 className="font-serif text-[22px] text-ink mb-1">Create Account</h1>
        <p className="text-[12px] text-muted mb-6">Join Gulf Sathyadhara today</p>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] text-muted mb-1.5">Full Name <span className="text-accent">*</span></label>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="Your full name"
              className={inp("name")}
            />
            {errors.name && <p className="text-[11px] text-accent mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[12px] text-muted mb-1.5">Mobile Number</label>
            <input
              value={form.mobile}
              onChange={set("mobile")}
              placeholder="971501234567"
              type="tel"
              className={inp("mobile")}
            />
          </div>

          <div>
            <label className="block text-[12px] text-muted mb-1.5">Email Address <span className="text-accent">*</span></label>
            <input
              value={form.email}
              onChange={set("email")}
              placeholder="you@email.com"
              type="email"
              className={inp("email")}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.email && <p className="text-[11px] text-accent mt-1">{errors.email}</p>}
          </div>

          {serverError && (
            <p className="text-[12px] text-accent bg-accent/10 px-3 py-2 rounded-xl">{serverError}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-ink text-bg text-[15px] font-semibold mt-2 active:opacity-80 transition-opacity disabled:opacity-60"
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 text-[13px] text-muted underline underline-offset-2 text-center"
        >
          Already have an account? Sign In
        </button>
      </div>

      <div className="pb-8 text-center">
        <p className="text-[11px] text-subtle">© 2025 Gulf Sathyadhara</p>
      </div>
    </div>
  );
}
