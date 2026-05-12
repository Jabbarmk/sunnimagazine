"use client";

import { useState, ReactNode } from "react";

export default function ImgWithFallback({
  src, alt = "", className, fallback,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [error, setError] = useState(false);
  if (!src || error) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}
