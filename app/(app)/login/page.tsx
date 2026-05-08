"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, skipLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setError("ദയവായി ഇ-മെയിലും പാസ്‌വേഡും നൽകുക."); return; }
    if (login(email, password)) {
      router.push("/");
    } else {
      setError("ഇ-മെയിൽ അല്ലെങ്കിൽ പാസ്‌വേഡ് തെറ്റാണ്.");
    }
  };

  const handleSkip = () => {
    skipLogin();
    router.push("/");
  };

  return (
    <div className="flex-1 flex flex-col bg-bg overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
        <img src="/logo.png" alt="Gulf Sathyadhara" className="w-[50%] h-auto object-contain mb-6" />

        <div className="w-full space-y-3">
          <div>
            <label className="block font-malayalam text-[12px] text-muted mb-1.5">ഇ-മെയിൽ</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border border-transparent focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block font-malayalam text-[12px] text-muted mb-1.5">പാസ്‌വേഡ്</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border border-transparent focus:border-gold/50 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <p className="font-malayalam text-[12px] text-accent pt-1">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3.5 rounded-xl bg-ink text-bg font-malayalam text-[15px] font-semibold mt-2 active:opacity-80 transition-opacity"
          >
            പ്രവേശിക്കുക
          </button>
        </div>

        <button
          onClick={handleSkip}
          className="mt-6 font-malayalam text-[13px] text-muted underline underline-offset-2"
        >
          ഇപ്പോൾ ഒഴിവാക്കുക
        </button>
      </div>

      <div className="pb-8 text-center">
        <p className="font-malayalam text-[11px] text-subtle">© 2025 ഗൾഫ് സത്യധാര</p>
      </div>
    </div>
  );
}
