"use client";

import { useRef } from "react";

function wrapSelection(value: string, start: number, end: number, before: string, after: string) {
  const selected = value.slice(start, end);
  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  return { newValue, newStart: start + before.length, newEnd: end + before.length };
}

export default function ParagraphEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const apply = (before: string, after: string) => {
    const el = ref.current;
    if (!el) return;
    const { newValue, newStart, newEnd } = wrapSelection(el.value, el.selectionStart, el.selectionEnd, before, after);
    onChange(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
    });
  };

  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); apply("**", "**"); }}
          title="Bold"
          className="w-7 h-7 rounded border border-gray-200 font-bold text-[13px] text-gray-700 hover:bg-gray-100 flex items-center justify-center"
        >B</button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); apply("_", "_"); }}
          title="Italic"
          className="w-7 h-7 rounded border border-gray-200 italic text-[13px] text-gray-700 hover:bg-gray-100 flex items-center justify-center"
        >I</button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"ആദ്യ ഖണ്ഡിക...\n\nരണ്ടാം ഖണ്ഡിക..."}
        rows={10}
        lang="ml"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 resize-y font-malayalam leading-[1.9]"
      />
    </div>
  );
}
