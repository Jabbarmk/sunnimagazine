import React from "react";

export function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
