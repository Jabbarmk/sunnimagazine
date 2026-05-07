"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getMagazine, saveMagazine } from "@/lib/api";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + 2 - i));

function EditMagazineForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [form, setForm] = useState<{
    id: string; title: string; month: string; year: string; cover: string; description: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMagazine(id).then((m) => {
      if (!m) { router.push("/dashboard/magazines"); return; }
      setForm({ id: m.id, title: m.title, month: m.month, year: m.year, cover: m.cover, description: m.description });
    });
  }, [id]);

  if (!form) return <div className="text-gray-400 text-[13px]">Loading…</div>;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => f ? { ...f, [k]: e.target.value } : f);

  const handleSave = async () => {
    if (!form.title || !form.month || !form.year) { setError("Title, Month, Year are required."); return; }
    try {
      const orig = await getMagazine(form.id);
      await saveMagazine({ ...orig, title: form.title, month: form.month, year: form.year, cover: form.cover, description: form.description });
      router.push("/dashboard/magazines");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <h1 className="text-[22px] font-semibold text-gray-900">Edit Magazine</h1>
        <span className="text-[12px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">{form.id}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Malayalam Content</div>
        <div className="space-y-4">
          <Row label="ശീർഷകം (Title)">
            <input value={form.title} onChange={set("title")} lang="ml"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam" />
          </Row>
          <Row label="വിവരണം (Description)">
            <textarea value={form.description} onChange={set("description")} lang="ml" rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam resize-y" />
          </Row>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Issue Details</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Row label="Month">
                <select value={form.month} onChange={set("month")}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Row>
              <Row label="Year">
                <select value={form.year} onChange={set("year")}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Row>
            </div>
            <Row label="Cover Image">
              <ImageUpload value={form.cover} onChange={(v) => setForm((f) => f ? { ...f, cover: v } : f)} />
            </Row>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
            Save Changes
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

export default function EditMagazinePage() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-[13px]">Loading…</div>}>
      <EditMagazineForm />
    </Suspense>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
