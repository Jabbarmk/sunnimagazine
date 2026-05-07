"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveArticle, getMagazines, getCategories, getAuthors, getArticles } from "@/lib/api";
import type { Category, Author } from "@/lib/store";
import type { Magazine } from "@/lib/data";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";

const EMPTY = {
  id: "", magazineId: "", title: "", caption: "", category: "",
  author: "", avatar: "", date: "", readTime: "", hero: "",
  paragraphsRaw: "", inlineImage: "", inlineImage2: "", bottomImage: "", pullQuote: "",
};

type FE = Record<string, string>;

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [fe, setFe] = useState<FE>({});
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    getMagazines().then((mags) => {
      setMagazines(mags);
      setForm((f) => ({ ...f, magazineId: mags[0]?.id ?? "" }));
    });
    getCategories().then(setCategories);
    getAuthors().then(setAuthors);
    getArticles().then((all) => {
      const existingIds = all.map((a: { id: string }) => a.id);
      let n = all.length + 1;
      while (existingIds.includes(`a${n}`)) n++;
      setForm((f) => ({ ...f, id: `a${n}`, date: formatted, readTime: "5 min read" }));
    });
  }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setFe((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  const setVal = (k: keyof typeof EMPTY) => (val: string) => {
    setForm((f) => ({ ...f, [k]: val }));
    setFe((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  const validate = () => {
    const errors: FE = {};
    if (!form.id.trim()) errors.id = "Article ID is required";
    if (!form.magazineId) errors.magazineId = "Please select a magazine";
    if (!form.title.trim()) errors.title = "Title is required";
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length) { setFe(errors); return; }
    try {
      const paragraphs = form.paragraphsRaw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      await saveArticle({
        id: form.id,
        magazineId: form.magazineId,
        title: form.title,
        caption: form.caption,
        category: form.category,
        author: form.author,
        avatar: form.avatar || `https://picsum.photos/seed/${form.id}/200/200`,
        date: form.date,
        readTime: form.readTime,
        hero: form.hero || `https://picsum.photos/seed/${form.id}/1200/900`,
        paragraphs,
        inlineImage: form.inlineImage || undefined,
        inlineImage2: form.inlineImage2 || undefined,
        bottomImage: form.bottomImage || undefined,
        pullQuote: form.pullQuote || undefined,
      });
      router.push("/dashboard/articles");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save. Please try again.");
    }
  };

  const inp = (hasErr: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none transition-colors ${hasErr ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-blue-400"}`;

  const sel = (hasErr: boolean) =>
    `w-full px-3 py-2 border rounded-lg text-[13px] outline-none bg-white transition-colors ${hasErr ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <h1 className="text-[22px] font-semibold text-gray-900">New Article</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Row label="Article ID" hint="e.g. a11" error={fe.id}>
          <input value={form.id} onChange={set("id")} placeholder="a11" className={inp(!!fe.id)} />
        </Row>
        <Row label="Magazine" error={fe.magazineId}>
          <select value={form.magazineId} onChange={set("magazineId")} className={sel(!!fe.magazineId)}>
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
              <input value={form.title} onChange={set("title")} placeholder="ലേഖനത്തിന്റെ തലക്കെട്ട്" lang="ml"
                className={inp(!!fe.title) + " text-[14px] font-malayalam"} />
            </Row>
            <Row label="ചെറു വിവരണം (Caption)">
              <input value={form.caption} onChange={set("caption")} placeholder="ഒരു ചെറിയ വിവരണം" lang="ml"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam" />
            </Row>
            <Row label="വിഭാഗം (Category)">
              <select value={form.category} onChange={set("category")}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 bg-white font-malayalam">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </Row>
            <Row label="ഉദ്ധൃതി (Pull Quote)" hint="Optional">
              <input value={form.pullQuote} onChange={set("pullQuote")} placeholder="ഒരു പ്രധാന ഉദ്ധൃതി..." lang="ml"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam" />
            </Row>
            <Row label="ഖണ്ഡികകൾ (Paragraphs)" hint="Separate paragraphs with a blank line">
              <textarea value={form.paragraphsRaw} onChange={set("paragraphsRaw")}
                placeholder={"ആദ്യ ഖണ്ഡിക...\n\nരണ്ടാം ഖണ്ഡിക..."} rows={10} lang="ml"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 resize-y font-malayalam leading-[1.9]" />
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
                  setForm((f) => ({ ...f, author: a?.name ?? "", avatar: a?.avatar ?? "" }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Select author</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {form.author && (
                <div className="flex items-center gap-2 mt-2">
                  {form.avatar && <img src={form.avatar} alt={form.author} className="w-7 h-7 rounded-full object-cover" />}
                  <span className="text-[12px] text-gray-500">{form.author}</span>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, author: "", avatar: "" }))} className="text-[11px] text-gray-400 hover:text-red-400">✕</button>
                </div>
              )}
            </Row>
            <Row label="Date">
              <input value={form.date} onChange={set("date")} placeholder="Jun 12, 2025"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
            </Row>
            <Row label="Read Time">
              <input value={form.readTime} onChange={set("readTime")} placeholder="5 min read"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
            </Row>
            <Row label="Hero Image" hint="Leave blank for placeholder">
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
          <button onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
            Save Article
          </button>
          <button onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-[13px] hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
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
