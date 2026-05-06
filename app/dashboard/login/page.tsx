"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    if (login(email, password)) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={{ fontFamily: "var(--font-inter)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[13px] font-semibold text-slate-800 mb-1">Gulf Sathyadhara</div>
          <div className="text-[12px] text-gray-400">Admin Panel</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-[20px] font-semibold text-gray-900 mb-6">Sign in</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="admin@gulfsathyadhara.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && <p className="text-[12px] text-red-500">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors mt-2"
            >
              Sign in
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Gulf Sathyadhara Admin · Internal use only
        </p>
      </div>
    </div>
  );
}
