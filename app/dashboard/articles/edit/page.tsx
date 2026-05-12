"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getArticle, saveArticle, getMagazines, getCategories, getAuthors } from "@/lib/api";
import type { Category, Author } from "@/lib/store";
import type { Magazine, PullQuote } from "@/lib/data";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";
import ParagraphEditor from "@/components/ParagraphEditor";

function EditArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [pullQuotes, setPullQuotes] = useState<PullQuote[]>([]);
  const [form, setForm] = useState<{
    id: string; magazineId: string; title: string; caption: string;
    category: string; author: string; avatar: string; date: string;
    readTime: string; hero: string; paragraphsRaw: string;
    inlineImage: string; inlineImage2: string; bottomImage: string;
  } | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    getMagazines().then(setMagazines);
    getCategories().then(setCategories);
    getAuthors().then(setAuthors);
    getArticle(id).then((a) => {
      if (!a) { router.push("/dashboard/articles"); return; }
      setPullQuotes(a.pullQuotes ?? []);
      setForm({
        id: a.id,
        magazineId: a.magazineId,
        title: a.title,
        caption: a.caption,
        category: a.category,
        author: a.author,
        avatar: a.avatar,
        date: a.date,
        readTime: a.readTime,
        hero: a.hero,
        paragraphsRaw: a.paragraphs.join("\n\n"),
        inlineImage: a.inlineImage ?? "",
        inlineImage2: a.inlineImage2 ?? "",
        bottomImage: a.bottomImage ?? "",
      });
    });
  }, [id]);

  if (!form) return <div className="text-gray-400 text-[13px]">Loading…</div>;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => f ? { ...f, [k]: e.target.value } : f);
    setFe((prev) => { const n = { ...prev }; delete n[k as string]; return n; });
  };

  const setVal = (k: keyof typeof form) => (val: string) => {
    setForm((f) => f ? { ...f, [k]: val } : f);
    setFe((prev) => { const n = { ...prev }; delete n[k as string]; return n; });
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!form.magazineId) errors.magazineId = "Please select a magazine";
    if (!form.title.trim()) errors.title = "Title is required";
    if (Object.keys(errors).length) { setFe(errors); return; }
    try {
      const paragraphs = form.paragraphsRaw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      await saveArticle({
        id: form.id, magazineId: form.magazineId, title: form.title,
        caption: form.caption, category: form.category, author: form.author,
        avatar: form.avatar, date: form.date, readTime: form.readTime, hero: form.hero,
        paragraphs,
        inlineImage: form.inlineImage || undefined,
        inlineImage2: form.inlineImage2 || undefined,
        bottomImage: form.bottomImage || undefined,
        pullQuotes: pullQuotes.filter(q => q.text.trim()),
      });
      router.push("/dashboard/articles");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <h1 className="text-[22px] font-semibold text-gray-900">Edit Article</h1>
        <span className="text-[12px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{form.id}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Row label="Magazine" error={fe.magazineId}>
          <select
            value={form.magazineId}
            onChange={set("magazineId")}
            className={`w-full px-3 py-2 border rounded-lg text-[13px] outline-none bg-white ${fe.magazineId ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`}
          >
            <option value="">Select magazine</option>
            {magazines.map((m) => (
              <option key={m.id} value={m.id}>{m.title} ({m.month} {m.year})</option>
            ))}
          </select>
        </Row>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Malayalam Content</div>
          <div className="space-y-5">
            <Row label="തലക്കെട്ട് (Title)" error={fe.title}>
              <MlInput value={form.title} onChange={set("title")} placeholder="ലേഖനത്തിന്റെ തലക്കെട്ട്" error={!!fe.title} />
            </Row>
            <Row label="ചെറു വിവരണം (Caption)">
              <MlInput value={form.caption} onChange={set("caption")} placeholder="ഒരു ചെറിയ വിവരണം" />
            </Row>
            <Row label="വിഭാഗം (Category)">
              <select
                value={form.category}
                onChange={set("category")}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 bg-white font-malayalam"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Row>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
                ഉദ്ധൃതി (Pull Quotes) <span className="text-gray-400 font-normal">— Optional, multiple allowed</span>
              </label>
              <div className="space-y-2">
                {pullQuotes.map((q, idx) => (
                  <div key={idx} className="flex gap-2 items-start border border-gray-200 rounded-lg p-3">
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={q.text}
                        onChange={(e) => setPullQuotes(prev => prev.map((x, i) => i === idx ? { ...x, text: e.target.value } : x))}
                        placeholder="ഉദ്ധൃതി ടെക്സ്റ്റ്..."
                        rows={2}
                        lang="ml"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-[13px] outline-none focus:border-blue-400 font-malayalam resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 whitespace-nowrap">After paragraph</span>
                        <input
                          type="number"
                          min={1}
                          value={q.afterParagraph}
                          onChange={(e) => setPullQuotes(prev => prev.map((x, i) => i === idx ? { ...x, afterParagraph: Math.max(1, Number(e.target.value)) } : x))}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-[13px] outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPullQuotes(prev => prev.filter((_, i) => i !== idx))}
                      className="text-gray-300 hover:text-red-400 text-[16px] mt-0.5 flex-shrink-0"
                    >✕</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPullQuotes(prev => [...prev, { text: "", afterParagraph: 3 }])}
                  className="flex items-center gap-1.5 text-[12px] text-blue-500 hover:text-blue-700 font-medium"
                >
                  <span className="text-[16px] leading-none">+</span> Add Pull Quote
                </button>
              </div>
            </div>
            <Row label="ഖണ്ഡികകൾ (Paragraphs)" hint="Separate paragraphs with a blank line">
              <ParagraphEditor value={form.paragraphsRaw} onChange={(v) => setForm((f) => f ? { ...f, paragraphsRaw: v } : f)} />
            </Row>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Author & Media</div>
          <div className="space-y-4">
            <Row label="Author">
              <select
                value={authors.find((a) => a.name === form.author)?.id ?? ""}
                onChange={(e) => {
                  const a = authors.find((x) => x.id === e.target.value);
                  setForm((f) => f ? { ...f, author: a?.name ?? "", avatar: a?.avatar ?? "" } : f);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Select author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {form.author && (
                <div className="flex items-center gap-2 mt-2">
                  {form.avatar && <img src={form.avatar} alt={form.author} className="w-7 h-7 rounded-full object-cover" />}
                  <span className="text-[12px] text-gray-500">{form.author}</span>
                  <button type="button" onClick={() => setForm((f) => f ? { ...f, author: "", avatar: "" } : f)} className="text-[11px] text-gray-400 hover:text-red-400">✕</button>
                </div>
              )}
            </Row>
            <Row label="Date">
              <Input value={form.date} onChange={set("date")} placeholder="Jun 12, 2025" />
            </Row>
            <Row label="Read Time">
              <Input value={form.readTime} onChange={set("readTime")} placeholder="5 min read" />
            </Row>
            <Row label="Hero Image">
              <ImageUpload value={form.hero} onChange={setVal("hero")} />
            </Row>
            <Row label="Inline Image" hint="Optional">
              <ImageUpload value={form.inlineImage} onChange={setVal("inlineImage")} />
            </Row>
            <Row label="Inline Image 2" hint="Optional">
              <ImageUpload value={form.inlineImage2} onChange={setVal("inlineImage2")} />
            </Row>
            <Row label="Bottom Image" hint="Optional">
              <ImageUpload value={form.bottomImage} onChange={setVal("bottomImage")} />
            </Row>
          </div>
        </div>

        {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-[13px]">Loading…</div>}>
      <EditArticleForm />
    </Suspense>
  );
}

function Row({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
        {label} {hint && <span className="text-gray-400 font-normal">— {hint}</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
  );
}

function MlInput({ value, onChange, placeholder, error }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; error?: boolean }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} lang="ml"
      className={`w-full px-3 py-2 border rounded-lg text-[14px] outline-none font-malayalam ${error ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"}`} />
  );
}
