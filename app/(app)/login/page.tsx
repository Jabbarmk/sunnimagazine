"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { skipLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
            <label className="block text-[12px] text-muted mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border border-transparent focus:border-gold/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-surface shadow-card text-[14px] text-ink outline-none border border-transparent focus:border-gold/50 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && goHome()}
            />
          </div>

          <button
            onClick={goHome}
            className="w-full py-3.5 rounded-xl bg-ink text-bg text-[15px] font-semibold mt-2 active:opacity-80 transition-opacity"
          >
            Sign In
          </button>
        </div>

        <button
          onClick={goHome}
          className="mt-6 text-[13px] text-muted underline underline-offset-2"
        >
          Skip for now
        </button>
      </div>

      <div className="pb-8 text-center">
        <p className="text-[11px] text-subtle">© 2025 Gulf Sathyadhara</p>
      </div>
    </div>
  );
}
