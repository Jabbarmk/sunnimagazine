"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getArtCategories, getEmailSettings, saveUserWriting } from "@/lib/api";
import { sendWritingEmails } from "@/lib/email";
import type { Art, ArtCategory, UserWriting } from "@/lib/store";
import { ChevronLeft, X, User } from "@/components/Icons";

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
          {art.authorAvatar ? (
            <img src={art.authorAvatar} alt={art.authorName}
              className="w-7 h-7 rounded-full object-cover border border-line flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center text-muted flex-shrink-0"><User size={14} /></div>
          )}
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
      // email failed but submission saved — still show success
    }
    setSending(false);
    setSent(true);
  };

  const inp = (k: string) =>
    `w-full px-3 py-2 border rounded-xl text-[13px] bg-bg outline-none text-ink ${errors[k] ? "border-accent" : "border-line focus:border-gold"}`;

  if (sent) {
    return (
      <div className="absolute inset-0 z-50 bg-bg flex flex-col items-center justify-center px-6">
        <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center mb-3 text-[28px]">✓</div>
        <h2 className="font-serif text-[20px] text-ink mb-1.5">Submitted!</h2>
        <p className="text-[13px] text-muted text-center mb-5">Your writing has been received. We'll review it and get back to you.</p>
        <button onClick={onClose} className="px-8 py-2.5 bg-ink text-bg rounded-2xl text-[13px] font-medium">Done</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-bg flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0 border-b border-line">
        <div className="font-serif text-[17px] text-ink">Send Your Writing</div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">Name *</label>
          <input value={form.name} onChange={set("name")} placeholder="Your full name" className={inp("name")} />
          {errors.name && <p className="text-[10px] text-accent mt-0.5">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">Email *</label>
          <input value={form.email} onChange={set("email")} type="email" placeholder="your@email.com" className={inp("email")} />
          {errors.email && <p className="text-[10px] text-accent mt-0.5">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">Category *</label>
          <select value={form.artCategoryId} onChange={set("artCategoryId")} className={inp("artCategoryId")}>
            <option value="">Select category</option>
            {artCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.artCategoryId && <p className="text-[10px] text-accent mt-0.5">{errors.artCategoryId}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">Your Writing *</label>
          <textarea value={form.description} onChange={set("description")} placeholder="Write your piece here…"
            rows={4} className={`${inp("description")} resize-none`} />
          {errors.description && <p className="text-[10px] text-accent mt-0.5">{errors.description}</p>}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted mb-1 uppercase tracking-wider">Image (optional)</label>
          {form.image ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={form.image} alt="" className="w-full aspect-[16/7] object-cover block" />
              <button onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center px-4 py-2.5 border border-dashed border-line rounded-xl cursor-pointer">
              <span className="text-[12px] text-muted">+ Choose image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>
        {emailError && <p className="text-[11px] text-accent bg-accent/10 px-3 py-1.5 rounded-xl">{emailError}</p>}
      </div>
      <div className="px-4 pt-3 pb-20 md:pb-4 flex-shrink-0 border-t border-line">
        <button onClick={handleSubmit} disabled={sending}
          className="w-full py-3 rounded-2xl bg-ink text-bg font-medium text-[14px] disabled:opacity-60">
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function ArtPageClient({ arts, magazineTitle }: { arts: Art[]; magazineTitle: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface shadow-card flex items-center justify-center text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-serif text-[18px] leading-none text-ink">Art</div>
          {magazineTitle && <div className="text-[11px] text-gold mt-0.5">{magazineTitle}</div>}
        </div>
        <div className="w-9 h-9" />
      </div>

      {arts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-muted">No art items for this issue.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-16 md:pb-4 space-y-4">
          {arts.map((art) => <ArtCard key={art.id} art={art} />)}
        </div>
      )}

      <div className="px-4 py-3 flex-shrink-0">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 rounded-2xl bg-gold/15 border border-gold/30 text-gold font-medium text-[14px] tracking-wide"
        >
          Send Your Writings
        </button>
      </div>

      {showModal && <SendWritingsModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
