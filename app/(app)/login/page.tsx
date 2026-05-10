"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { skipLogin, loginAppUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your mobile/email and password.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await loginAppUser(identifier.trim(), password.trim());
    setLoading(false);
    if (ok) {
      router.push("/");
    } else {
      setError("Invalid mobile/email or password.");
    }
  };

  const goHome = () => {
    skipLogin();
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
        <img src="/logo.png" alt="Gulf Sathyadhara" className="w-[50%] h-auto object-contain mb-8" />

        <div className="w-full space-y-3">
          <div>
            <label className="block text-[12px] text-muted mb-1.5">Mobile / Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
              placeholder="Mobile number or email"
              className="w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border border-transparent focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border border-transparent focus:border-gold/50 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
          </div>

          {error && (
            <p className="text-[12px] text-accent bg-accent/10 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-ink text-bg text-[15px] font-semibold mt-2 active:opacity-80 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>

        <button
          onClick={goHome}
          className="mt-6 text-[13px] text-muted underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>

      <div className="pb-8 text-center space-y-2">
        <p className="text-[13px] text-muted">
          New here?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-gold font-medium underline underline-offset-2"
          >
            Create an account
          </button>
        </p>
        <p className="text-[11px] text-subtle">© 2025 Gulf Sathyadhara</p>
      </div>
    </div>
  );
}
