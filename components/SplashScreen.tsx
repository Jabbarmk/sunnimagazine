"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const seen = sessionStorage.getItem("splash_seen");
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      sessionStorage.setItem("splash_seen", "1");
      setVisible(false);
    }, 380);
  };

  const handleLogin = () => {
    dismiss();
    setTimeout(() => router.push("/login"), 380);
  };

  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col"
      style={{
        background: "#16161C",
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(1.04)" : "scale(1)",
        transition: "opacity 0.38s ease, transform 0.38s ease",
      }}
    >
      {/* Top decorative arc */}
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 120% 60% at 50% -10%, rgba(176,138,58,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Bottom decorative arc */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 110%, rgba(176,138,58,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* Logo */}
        <div
          className="mb-8"
          style={{
            opacity: leaving ? 0 : 1,
            transform: leaving ? "translateY(-12px)" : "translateY(0)",
            transition: "opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s",
          }}
        >
          <img
            src="/logo.png"
            alt="Gulf Sathyadhara"
            className="w-48 h-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>

        {/* Divider */}
        <div
          className="w-12 h-px mb-6"
          style={{
            background: "linear-gradient(90deg, transparent, #B08A3A, transparent)",
            opacity: leaving ? 0 : 1,
            transition: "opacity 0.3s ease 0.1s",
          }}
        />

        {/* Tagline */}
        <p
          className="text-center text-[13px] tracking-[0.18em] uppercase mb-16"
          style={{
            color: "rgba(255,255,255,0.4)",
            opacity: leaving ? 0 : 1,
            transition: "opacity 0.3s ease 0.15s",
          }}
        >
          Gulf Sathyadhara
        </p>

        {/* Buttons */}
        <div
          className="w-full space-y-3"
          style={{
            opacity: leaving ? 0 : 1,
            transform: leaving ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s",
          }}
        >
          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide"
            style={{ background: "#B08A3A", color: "#16161C" }}
          >
            Login
          </button>
          <button
            onClick={dismiss}
            className="w-full py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Skip
          </button>
        </div>
      </div>

      {/* Bottom tag */}
      <div className="pb-8 flex justify-center relative">
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
          Gulf Sathyadhara
        </span>
      </div>
    </div>
  );
}
