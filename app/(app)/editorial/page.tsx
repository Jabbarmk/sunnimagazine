"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getEditorial } from "@/lib/api";
import { BackBar } from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

// ── Icons ───────────────────────────────────────────────────

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const CrownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20M5 20 3 8l4.5 4.5L12 4l4.5 8.5L21 8l-2 12"/>
  </svg>
);
const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const PrinterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const BadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 8.5H3l5.5 4-2 7L12 16l5.5 3.5-2-7L21 8.5h-6.5z"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11 19.79 19.79 0 0 1 1.62 2.48a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 6.68a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14z"/>
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

// ── Sub-components ──────────────────────────────────────────

function Section({
  icon, label, children,
}: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-line last:border-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold tracking-[0.15em] text-gold uppercase mb-1">{label}</div>
          {children}
        </div>
      </div>
    </div>
  );
}

function TextValue({ value }: { value: string }) {
  return (
    <p className="text-[14px] text-ink leading-relaxed whitespace-pre-line">{value}</p>
  );
}

function ListValue({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-[14px] text-ink">{item}</li>
      ))}
    </ul>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="px-5 py-3 bg-surface border-b border-line">
      <span className="text-[11px] font-bold tracking-[0.2em] text-muted uppercase">{label}</span>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

function EditorialInner() {
  const router = useRouter();
  const params = useSearchParams();
  const magazineId = params.get("magazineId");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    getEditorial(magazineId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, magazineId]);

  if (loading || !data) {
    return (
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
          <div className="loading-bar w-full" />
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
            <div className="w-5 h-4 rounded skeleton-shimmer" />
            <div className="h-4 w-28 rounded skeleton-shimmer" />
          </div>
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-2.5 w-20 rounded skeleton-shimmer" />
                  <div className="h-3.5 w-48 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
        <BackBar title="Editorial" />

        {/* Header Banner */}
        <div className="px-5 py-5 border-b border-line" style={{ background: "linear-gradient(135deg, #16161C 0%, #2a2218 100%)" }}>
          <div className="text-[10px] tracking-[0.25em] text-gold uppercase font-semibold mb-1">Gulf Sathyadhara</div>
          <h1 className="text-white font-bold text-[22px] leading-tight font-malayalam">Editorial Board</h1>
          <p className="text-white/50 text-[12px] mt-1">Publication & Contact Details</p>
        </div>

        {/* Office */}
        <GroupHeader label="About" />
        <Section icon={<MapPinIcon />} label="Registered Office">
          <TextValue value={data.registeredOffice} />
        </Section>

        {/* Kerala Team */}
        <GroupHeader label="Kerala" />
        <Section icon={<CrownIcon />} label="Managing Director">
          <TextValue value={data.managingDirector} />
        </Section>
        <Section icon={<PenIcon />} label="Chief Editor">
          <TextValue value={data.chiefEditor} />
        </Section>

        {/* Gulf Edition */}
        <GroupHeader label="Gulf Edition" />
        <Section icon={<ShieldIcon />} label="Chairman">
          <TextValue value={data.gulfChairman} />
        </Section>
        <Section icon={<EditIcon />} label="Editor in Charge">
          <TextValue value={data.gulfEditorInCharge} />
        </Section>
        {data.subEditors?.length > 0 && (
          <Section icon={<UsersIcon />} label="Sub Editors">
            <ListValue items={data.subEditors} />
          </Section>
        )}
        {data.management?.length > 0 && (
          <Section icon={<BriefcaseIcon />} label="Management">
            <ListValue items={data.management} />
          </Section>
        )}
        <Section icon={<TruckIcon />} label="Distribution">
          <TextValue value={data.distribution} />
        </Section>
        <Section icon={<PrinterIcon />} label="Printing At">
          <TextValue value={data.printingAt} />
        </Section>
        <Section icon={<BadgeIcon />} label="License">
          <p className="text-[14px] text-ink">{data.licenseNo}</p>
          <p className="text-[13px] text-muted mt-0.5">{data.licenseBody}</p>
        </Section>

        {/* UAE Contact */}
        <GroupHeader label="Contact" />
        <Section icon={<GlobeIcon />} label="UAE">
          <p className="text-[14px] text-ink">{data.uaeAddress}</p>
          <p className="text-[14px] text-ink flex items-center gap-1.5 mt-1">
            <PhoneIcon />
            <span>{data.uaeTel}</span>
          </p>
          <p className="text-[13px] text-muted flex items-center gap-1.5 mt-1">
            <MailIcon />
            <span>{data.uaeEditorEmail}</span>
          </p>
          <p className="text-[13px] text-muted flex items-center gap-1.5 mt-0.5">
            <MailIcon />
            <span>{data.uaeSubscriptionEmail}</span>
          </p>
        </Section>
        {data.qatar?.length > 0 && (
          <Section icon={<PhoneIcon />} label="Qatar">
            <ListValue items={data.qatar} />
          </Section>
        )}
        {data.kuwait?.length > 0 && (
          <Section icon={<PhoneIcon />} label="Kuwait">
            <ListValue items={data.kuwait} />
          </Section>
        )}
        {data.bahrain?.length > 0 && (
          <Section icon={<PhoneIcon />} label="Bahrain">
            <ListValue items={data.bahrain} />
          </Section>
        )}
        {data.saudiArabia?.length > 0 && (
          <Section icon={<PhoneIcon />} label="Saudi Arabia">
            <ListValue items={data.saudiArabia} />
          </Section>
        )}
        {data.oman?.length > 0 && (
          <Section icon={<PhoneIcon />} label="Oman">
            <ListValue items={data.oman} />
          </Section>
        )}

        {/* Design */}
        <GroupHeader label="Design" />
        <Section icon={<PaletteIcon />} label="Design & Layout">
          <p className="text-[14px] text-ink">{data.designLayout}</p>
          {data.designStudio && (
            <p className="text-[13px] text-muted mt-0.5">{data.designStudio}</p>
          )}
        </Section>
      </div>
      <BottomNav />
    </>
  );
}

export default function EditorialPage() {
  return (
    <Suspense fallback={
      <>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-[94px] md:pb-[30px]">
          <div className="loading-bar w-full" />
          <div className="p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-2.5 w-20 rounded skeleton-shimmer" />
                  <div className="h-3.5 w-48 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </>
    }>
      <EditorialInner />
    </Suspense>
  );
}
