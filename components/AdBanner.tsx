export default function AdBanner() {
  return (
    <div className="mx-5 mt-6 mb-2 relative h-[80px] rounded-xl overflow-hidden bg-gradient-to-br from-ink to-navy text-bg">
      <span className="absolute top-2 right-3 text-[8px] tracking-[0.25em] uppercase text-bg/50">
        Sponsored
      </span>
      <div className="h-full flex items-center px-5 gap-4">
        <div className="w-10 h-10 rounded-full bg-gold/90 flex items-center justify-center font-serif text-ink text-[17px]">
          A
        </div>
        <div>
          <div className="font-serif text-[15px] leading-tight">A hand-bound notebook</div>
          <div className="text-[11px] text-bg/70 mt-0.5">Crafted paper, stitched by hand.</div>
        </div>
      </div>
    </div>
  );
}
