"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveArticle, getMagazines } from "@/lib/store";
import type { Magazine } from "@/lib/data";

const EMPTY = {
  id: "", magazineId: "", title: "", caption: "", category: "",
  author: "", avatar: "", date: "", readTime: "", hero: "",
  paragraphsRaw: "", inlineImage: "", pullQuote: "",
};

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [error, setError] = useState("");

  useEffect(() => { setMagazines(getMagazines()); }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.id || !form.title || !form.magazineId) {
      setError("ID, Title, Magazine is required.");
      return;
    }
    const paragraphs = form.paragraphsRaw
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    saveArticle({
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
      pullQuote: form.pullQuote || undefined,
    });
    router.push("/dashboard/articles");
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <h1 className="text-[22px] font-semibold text-gray-900">New Article</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Row label="Article ID" hint="e.g. a11">
          <Input value={form.id} onChange={set("id")} placeholder="a11" />
        </Row>
        <Row label="Magazine">
          <select
            value={form.magazineId}
            onChange={set("magazineId")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white"
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
            <Row label="തലക്കെട്ട് (Title)">
              <MlInput value={form.title} onChange={set("title")} placeholder="ലേഖനത്തിന്റെ തലക്കെട്ട്" />
            </Row>
            <Row label="ചെറു വിവരണം (Caption)">
              <MlInput value={form.caption} onChange={set("caption")} placeholder="ഒരു ചെറിയ വിവരണം" />
            </Row>
            <Row label="വിഭാഗം (Category)">
              <MlInput value={form.category} onChange={set("category")} placeholder="ജാലകം, ഉപന്യാസം..." />
            </Row>
            <Row label="ഉദ്ധൃതി (Pull Quote)" hint="Optional">
              <MlInput value={form.pullQuote} onChange={set("pullQuote")} placeholder="ഒരു പ്രധാന ഉദ്ധൃതി..." />
            </Row>
            <Row label="ഖണ്ഡികകൾ (Paragraphs)" hint="Separate paragraphs with a blank line">
              <textarea
                value={form.paragraphsRaw}
                onChange={set("paragraphsRaw")}
                placeholder={"ആദ്യ ഖണ്ഡിക...\n\nരണ്ടാം ഖണ്ഡിക..."}
                rows={10}
                lang="ml"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 resize-y font-malayalam leading-[1.9]"
              />
            </Row>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Author & Media</div>
          <div className="space-y-4">
            <Row label="Author Name">
              <Input value={form.author} onChange={set("author")} placeholder="Author" />
            </Row>
            <Row label="Date">
              <Input value={form.date} onChange={set("date")} placeholder="Jun 12, 2025" />
            </Row>
            <Row label="Read Time">
              <Input value={form.readTime} onChange={set("readTime")} placeholder="5 min read" />
            </Row>
            <Row label="Hero Image URL" hint="Leave blank for placeholder">
              <Input value={form.hero} onChange={set("hero")} placeholder="https://..." />
            </Row>
            <Row label="Inline Image URL" hint="Optional">
              <Input value={form.inlineImage} onChange={set("inlineImage")} placeholder="https://..." />
            </Row>
            <Row label="Avatar URL" hint="Leave blank for placeholder">
              <Input value={form.avatar} onChange={set("avatar")} placeholder="https://..." />
            </Row>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
          >
            Save Article
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

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
        {label} {hint && <span className="text-gray-400 font-normal">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400"
    />
  );
}

function MlInput({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      lang="ml"
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam"
    />
  );
}
