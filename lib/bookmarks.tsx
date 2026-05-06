"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

type Ctx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
};

const BookmarkCtx = createContext<Ctx | null>(null);
const KEY = "folio-bookmarks-v1";

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {}
  }, [ids, hydrated]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) =>
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );
  const remove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    []
  );

  return (
    <BookmarkCtx.Provider value={{ ids, has, toggle, remove }}>{children}</BookmarkCtx.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkCtx);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
