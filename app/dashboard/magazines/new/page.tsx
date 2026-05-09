"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveMagazine } from "@/lib/api";
import ImageUpload from "@/app/dashboard/_components/ImageUpload";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_ABBR = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

const now = new Date();
const CURRENT_MONTH = MONTHS[now.getMonth()];
const CURRENT_YEAR = String(now.getFullYear());
const YEARS = Array.from({ length: 10 }, (_, i) => String(now.getFullYear() + 2 - i));

function makeId(month: string, year: string) {
  const abbr = MONTH_ABBR[MONTHS.indexOf(month)];
  return abbr && year ? `${abbr}-${year}` : "";
}

export default function NewMagazinePage() {
  const router = useRouter();
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [id, setId] = useState(makeId(CURRENT_MONTH, CURRENT_YEAR));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");
  const [fe, setFe] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState("");
  const idTouched = useRef(false);

  useEffect(() => {
    if (!idTouched.current) setId(makeId(month, year));
  }, [month, year]);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    idTouched.current = true;
    setId(e.target.value);
    setFe((p) => { const n = { ...p }; delete n.id; return n; });
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!id.trim()) errors.id = "Issue ID is required";
    if (!title.trim()) errors.title = "Title is required";
    if (Object.keys(errors).length) { setFe(errors); return; }
    try {
      await saveMagazine({
        id,
        title,
        month,
        year,
        cover: cover || `https://picsum.photos/seed/${id}/800/1000`,
        description,
        articleIds: [],
      });
      router.push("/dashboard/magazines");
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-[20px]">←</button>
        <h1 className="text-[22px] font-semibold text-gray-900">New Magazine Issue</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Row label="Issue ID" hint="auto-generated, editable" error={fe.id}>
          <input
            value={id}
            onChange={handleIdChange}
            placeholder="jul-2025"
            className={`w-full px-3 py-2 border rounded-lg text-[13px] outline-none font-mono ${fe.id ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`}
          />
        </Row>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Malayalam Content</div>
          <div className="space-y-4">
            <Row label="ശീർഷകം (Title)" error={fe.title}>
              <input value={title} onChange={(e) => { setTitle(e.target.value); setFe((p) => { const n={...p}; delete n.title; return n; }); }} placeholder="ഗൾഫ് സത്യധാര" lang="ml"
                className={`w-full px-3 py-2 border rounded-lg text-[14px] outline-none font-malayalam ${fe.title ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"}`} />
            </Row>
            <Row label="വിവരണം (Description)">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ഈ ലക്കത്തെക്കുറിച്ച്..." lang="ml" rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 font-malayalam resize-y" />
            </Row>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Issue Details</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Row label="Month">
                <select value={month} onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Row>
              <Row label="Year">
                <select value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-400 bg-white">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Row>
            </div>
            <Row label="Cover Image" hint="Portrait/vertical ratio recommended">
              {cover && (
                <div className="flex justify-center mb-3">
                  <img src={cover} alt="cover preview"
                    className="w-36 object-cover rounded-xl shadow-md border border-gray-200"
                    style={{ aspectRatio: "3/4" }} />
                </div>
              )}
              <ImageUpload value={cover} onChange={setCover} />
            </Row>
          </div>
        </div>

        {saveError && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}

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
