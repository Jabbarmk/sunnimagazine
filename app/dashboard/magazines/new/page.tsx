"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMagazine } from "@/lib/store";

const EMPTY = { id: "", title: "", month: "", year: "", cover: "", description: "" };

export default function NewMagazinePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.id || !form.title || !form.month || !form.year) {
      setError("ID, Title, Month, Year are required.");
      return;
    }
    saveMagazine({
      id: form.id,
      title: form.title,
      month: form.month,
      year: form.year,
      cover: form.cover || `https://picsum.photos/seed/${form.id}/800/1000`,
      description: form.description,
      articleIds: [],
    });
    router.push("/dashboard/magazines");
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <h1 className="text-[22px] font-semibold text-gray-900">New Magazine Issue</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Row label="Issue ID" hint="e.g. jul-2025">
          <input value={form.id} onChange={set("id")} placeholder="jul-2025"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
        </Row>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Malayalam Content</div>
          <div className="space-y-4">
            <Row label="ശീർഷകം (Title)">
              <input value={form.title} onChange={set("title")} placeholder="ഗൾഫ് സത്യധാര" lang="ml"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam" />
            </Row>
            <Row label="വിവരണം (Description)">
              <input value={form.description} onChange={set("description")} placeholder="ഈ ലക്കത്തെക്കുറിച്ച്..." lang="ml"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam" />
            </Row>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Issue Details</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Row label="Month">
                <select value={form.month} onChange={set("month")}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
                  <option value="">Select</option>
                  {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Row>
              <Row label="Year">
                <input value={form.year} onChange={set("year")} placeholder="2025"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
              </Row>
            </div>
            <Row label="Cover Image URL" hint="Leave blank for placeholder">
              <input value={form.cover} onChange={set("cover")} placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400" />
            </Row>
          </div>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors">
            Save Issue
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
