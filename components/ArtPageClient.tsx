"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getArtCategories, getEmailSettings, saveUserWriting } from "@/lib/api";
import { sendWritingEmails } from "@/lib/email";
import type { Art, ArtCategory, UserWriting } from "@/lib/store";
import Link from "next/link";
import { ChevronLeft, X, User } from "@/components/Icons";
import ImgWithFallback from "@/components/ImgWithFallback";

function ArtCard({ art }: { art: Art }) {
  return (
    <div className="rounded-2xl bg-surface shadow-card overflow-hidden">
      {art.artCategoryName && (
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
            {art.artCategoryName}
          </span>
        </div>
      )}
      <div className="px-4 pb-3">
        <h2 className="font-serif text-[20px] text-ink leading-snug" lang="ml">{art.title}</h2>
      </div>
      {art.image && (
        <img src={art.image} alt={art.title} className="w-full aspect-[4/3] object-cover block" />
      )}
      {art.authorName && (
        <div className="flex items-center gap-2.5 px-4 pt-3">
          <ImgWithFallback src={art.authorAvatar} alt={art.authorName}
            className="w-7 h-7 rounded-full object-cover border border-line flex-shrink-0"
            fallback={<div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center text-muted flex-shrink-0"><User size={14} /></div>} />
          <span className="text-[11px] text-muted">{art.authorName}</span>
        </div>
      )}
      {art.description ? (
        <div className="px-4 pt-2 pb-4">
          <p className="text-[13px] text-ink/80 leading-relaxed whitespace-pre-wrap" lang="ml">{art.description}</p>
        </div>
      ) : (
        <div className="pb-4" />
      )}
    </div>
  );
}

function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = dataUrl;
  });
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-ink">
        {label}
        {hint && <span className="text-muted font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const baseInput = "w-full px-4 py-3 rounded-xl text-[14px] text-ink bg-bg border outline-none transition-colors placeholder:text-muted/60";
const fieldCls = (err?: string) => `${baseInput} ${err ? "border-red-400 focus:border-red-400" : "border-line focus:border-gold"}`;

function SendWritingsModal({ onClose }: { onClose: () => void }) {
  const [artCats, setArtCats] = useState<ArtCategory[]>([]);
  const [form, setForm] = useState({ name: "", email: "", artCategoryId: "", description: "", image: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => { getArtCategories().then(setArtCats); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      setForm((f) => ({ ...f, image: compressed }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.artCategoryId) errs.artCategoryId = "Please select a category";
    if (!form.description.trim()) errs.description = "Description is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSending(true);
    setEmailError("");
    const selCat = artCats.find((c) => c.id === form.artCategoryId);
    const writing: UserWriting = {
      id: "uw_" + Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      artCategoryId: form.artCategoryId,
      artCategoryName: selCat?.name ?? "",
      description: form.description.trim(),
      image: form.image,
      sentAt: new Date().toISOString(),
      status: "pending",
    };
    try {
      await saveUserWriting(writing);
    } catch {
      setSending(false);
      setEmailError("Failed to submit. Please try again.");
      return;
    }
    try {
      const emailSettings = await getEmailSettings();
      await sendWritingEmails(emailSettings, writing);
    } catch {
      // email failed but submission saved
    }
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="absolute inset-0 z-50 bg-bg flex flex-col items-center justify-center px-8">
        <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B08A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-serif text-[24px] text-ink mb-2">Submitted!</h2>
        <p className="text-[14px] text-muted text-center leading-relaxed mb-8">
          Your writing has been received. We'll review it and get back to you.
        </p>
        <button onClick={onClose} className="px-10 py-3.5 bg-ink text-bg rounded-2xl text-[14px] font-semibold tracking-wide">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-bg flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 flex-shrink-0">
        <div>
          <h2 className="font-serif text-[22px] text-ink leading-tight">Send Your Writing</h2>
          <p className="text-[12px] text-muted mt-1">Share your piece with our editors</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink flex-shrink-0 mt-0.5"
        >
          <X size={16} />
        </button>
      </div>
      <div className="h-px bg-line flex-shrink-0" />

      {/* Fields */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" error={errors.name}>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="Full name"
              className={fieldCls(errors.name)}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <input
              value={form.email}
              onChange={set("email")}
              type="email"
              placeholder="your@email.com"
              className={fieldCls(errors.email)}
            />
          </Field>
        </div>

        <Field label="Category" error={errors.artCategoryId}>
          <select
            value={form.artCategoryId}
            onChange={set("artCategoryId")}
            className={`${fieldCls(errors.artCategoryId)} bg-bg`}
          >
            <option value="">Select a category…</option>
            {artCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="Your Writing" error={errors.description}>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Write your piece here…"
            rows={6}
            lang="ml"
            className={`${fieldCls(errors.description)} resize-none leading-relaxed`}
          />
        </Field>

        <Field label="Image" hint="optional">
          {form.image ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={form.image} alt="" className="w-full aspect-[16/7] object-cover block" />
              <button
                onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-1.5 py-6 border border-dashed border-line rounded-xl cursor-pointer hover:border-gold/50 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[13px] text-muted">Tap to choose image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </Field>

        <button
          onClick={handleSubmit}
          disabled={sending}
          className="w-full py-4 rounded-2xl bg-gold text-white font-semibold text-[15px] tracking-wide disabled:opacity-60 transition-opacity"
        >
          {sending ? "Sending…" : "Submit Writing"}
        </button>

        {emailError && (
          <p className="text-[13px] text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
            {emailError}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ArtPageClient({ arts, magazineTitle }: { arts: Art[]; magazineTitle: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-serif text-[18px] leading-none text-ink">ചിത്ര കല</div>
          {magazineTitle && <div className="text-[11px] text-gold mt-0.5">{magazineTitle}</div>}
        </div>
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[94px] md:pb-[30px] space-y-4">
        {arts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px] text-muted">No art items for this issue.</p>
          </div>
        ) : (
          arts.map((art) => <ArtCard key={art.id} art={art} />)
        )}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl bg-gold text-white font-semibold text-[15px] tracking-wide hover:bg-gold/90 transition-colors"
        >
          Send Your Writings
        </button>
        <Link href="/">
          <button className="w-full py-3.5 rounded-2xl border-2 border-gold text-gold font-semibold text-[15px] tracking-wide hover:bg-gold hover:text-white transition-colors">
            More Topics
          </button>
        </Link>
      </div>

      {showModal && <SendWritingsModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
