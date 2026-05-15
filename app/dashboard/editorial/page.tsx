"use client";

import { useState, useEffect } from "react";
import { getEditorial, saveEditorial, getMagazinesDashboard } from "@/lib/api";
import { DEFAULT_EDITORIAL as DEFAULT } from "@/lib/editorial";

type Editorial = typeof DEFAULT;
type Magazine = { id: string; title: string; month: string; year: string };

// ── Icons ───────────────────────────────────────────────────

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const CrownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20M4 20 7 8l5 5 5-10 5 15"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const PrinterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11 19.79 19.79 0 0 1 1.62 2.48a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 6.68a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14z"/>
  </svg>
);
const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Sub-components ──────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="text-amber-600">{icon}</span>
        <h2 className="text-[17px] font-semibold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-[12px] text-gray-400 mt-0.5 ml-6">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-amber-400 transition-colors";
const textareaCls = `${inputCls} resize-y`;

function ListEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => { const t = draft.trim(); if (!t) return; onChange([...values, t]); setDraft(""); };
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => { const next = [...values]; next[i] = val; onChange(next); };
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={v} onChange={(e) => update(i, e.target.value)} className={`${inputCls} flex-1`} />
            <button onClick={() => remove(i)} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><XIcon /></button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="Add name…" className={`${inputCls} flex-1`} />
          <button onClick={add} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"><PlusIcon /></button>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">{children}</div>;
}

// ── Page ────────────────────────────────────────────────────

export default function EditorialPage() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [selectedMagId, setSelectedMagId] = useState<string | null>(null);
  const [form, setForm] = useState<Editorial>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Load magazines + most recently updated editorial on mount
  useEffect(() => {
    Promise.all([getMagazinesDashboard(), getEditorial()]).then(([mags, ed]) => {
      setMagazines(mags);
      setSelectedMagId(ed.magazineId ?? null);
      const { magazineId: _, ...data } = ed;
      setForm({ ...DEFAULT, ...data });
      setLoading(false);
    });
  }, []);

  // When user picks a different magazine, load its editorial
  const handleMagChange = async (magId: string | null) => {
    setSwitching(true);
    setSelectedMagId(magId);
    const ed = await getEditorial(magId);
    const { magazineId: _, ...data } = ed;
    setForm({ ...DEFAULT, ...data });
    setSwitching(false);
  };

  const set = (k: keyof Editorial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setList = (k: keyof Editorial) => (v: string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await saveEditorial({ ...form, magazineId: selectedMagId });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selectedMag = magazines.find((m) => m.id === selectedMagId);

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* ── Magazine Selector ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Editorial For</div>
        <select
          value={selectedMagId ?? ""}
          onChange={(e) => handleMagChange(e.target.value || null)}
          disabled={switching}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-amber-400 transition-colors disabled:opacity-60"
        >
          <option value="">— Global Default —</option>
          {magazines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} — {m.month} {m.year}
            </option>
          ))}
        </select>
        {selectedMag ? (
          <p className="text-[11px] text-amber-600 mt-2 font-medium">
            Editing editorial for: {selectedMag.title} ({selectedMag.month} {selectedMag.year})
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 mt-2">
            This is the global default — used for magazines without their own editorial.
          </p>
        )}
        {switching && <p className="text-[11px] text-blue-500 mt-1">Loading editorial…</p>}
      </div>

      {/* ── Office ──────────────────────────────────────── */}
      <div>
        <SectionHeader icon={<BuildingIcon />} title="Registered Office" />
        <Card>
          <Field label="Office Address">
            <textarea value={form.registeredOffice} onChange={set("registeredOffice")} rows={3} className={textareaCls} />
          </Field>
        </Card>
      </div>

      {/* ── Kerala Team ─────────────────────────────────── */}
      <div>
        <SectionHeader icon={<CrownIcon />} title="Kerala Team" />
        <Card>
          <Field label="Managing Director">
            <input value={form.managingDirector} onChange={set("managingDirector")} className={inputCls} />
          </Field>
          <Field label="Chief Editor">
            <textarea value={form.chiefEditor} onChange={set("chiefEditor")} rows={2} className={textareaCls} />
          </Field>
        </Card>
      </div>

      {/* ── Gulf Edition ────────────────────────────────── */}
      <div>
        <SectionHeader icon={<GlobeIcon />} title="Gulf Edition" subtitle="Editorial board for the Gulf region" />
        <Card>
          <Field label="Chairman">
            <input value={form.gulfChairman} onChange={set("gulfChairman")} className={inputCls} />
          </Field>
          <Field label="Editor in Charge">
            <input value={form.gulfEditorInCharge} onChange={set("gulfEditorInCharge")} className={inputCls} />
          </Field>
          <ListEditor label="Sub Editors" values={form.subEditors} onChange={setList("subEditors")} />
        </Card>
      </div>

      {/* ── Management ──────────────────────────────────── */}
      <div>
        <SectionHeader icon={<BriefcaseIcon />} title="Management" />
        <Card>
          <ListEditor label="Management Members" values={form.management} onChange={setList("management")} />
        </Card>
      </div>

      {/* ── Production ──────────────────────────────────── */}
      <div>
        <SectionHeader icon={<PrinterIcon />} title="Production & Distribution" />
        <Card>
          <Field label="Distribution">
            <input value={form.distribution} onChange={set("distribution")} className={inputCls} />
          </Field>
          <Field label="Printing At">
            <input value={form.printingAt} onChange={set("printingAt")} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="License No">
              <input value={form.licenseNo} onChange={set("licenseNo")} className={inputCls} />
            </Field>
            <Field label="License Body">
              <input value={form.licenseBody} onChange={set("licenseBody")} className={inputCls} />
            </Field>
          </div>
        </Card>
      </div>

      {/* ── UAE Contact ─────────────────────────────────── */}
      <div>
        <SectionHeader icon={<PhoneIcon />} title="Contact — UAE" />
        <Card>
          <Field label="Address">
            <input value={form.uaeAddress} onChange={set("uaeAddress")} className={inputCls} />
          </Field>
          <Field label="Tel">
            <input value={form.uaeTel} onChange={set("uaeTel")} className={inputCls} />
          </Field>
          <Field label="Editor Email">
            <input value={form.uaeEditorEmail} onChange={set("uaeEditorEmail")} type="email" className={inputCls} />
          </Field>
          <Field label="Subscription Email">
            <input value={form.uaeSubscriptionEmail} onChange={set("uaeSubscriptionEmail")} type="email" className={inputCls} />
          </Field>
        </Card>
      </div>

      {/* ── Other Countries ─────────────────────────────── */}
      <div>
        <SectionHeader icon={<GlobeIcon />} title="Regional Representatives" subtitle="Country-wise contact persons and numbers" />
        <Card>
          <ListEditor label="Qatar" values={form.qatar} onChange={setList("qatar")} />
          <ListEditor label="Kuwait" values={form.kuwait} onChange={setList("kuwait")} />
          <ListEditor label="Bahrain" values={form.bahrain} onChange={setList("bahrain")} />
          <ListEditor label="Saudi Arabia" values={form.saudiArabia} onChange={setList("saudiArabia")} />
          <ListEditor label="Oman" values={form.oman} onChange={setList("oman")} />
        </Card>
      </div>

      {/* ── Design ──────────────────────────────────────── */}
      <div>
        <SectionHeader icon={<PaletteIcon />} title="Design & Layout" />
        <Card>
          <Field label="Designer / Layout">
            <input value={form.designLayout} onChange={set("designLayout")} className={inputCls} />
          </Field>
          <Field label="Design Studio">
            <input value={form.designStudio} onChange={set("designStudio")} className={inputCls} />
          </Field>
        </Card>
      </div>

      {/* ── Save ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={handleSave}
          disabled={saving || switching}
          className="px-6 py-2.5 bg-amber-500 text-white rounded-lg text-[13px] font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : `Save${selectedMag ? ` — ${selectedMag.month} ${selectedMag.year}` : " Global"}`}
        </button>
        {saved && <span className="text-[12px] text-green-600 font-medium">✓ Saved successfully</span>}
      </div>

    </div>
  );
}
