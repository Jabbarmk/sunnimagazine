"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type ParagraphBookmark = {
  id: string;
  articleId: string;
  articleTitle: string;
  paragraphIndex: number;
  excerpt: string;
  savedAt: number;
};

type Ctx = {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  paraBookmarks: ParagraphBookmark[];
  hasPara: (articleId: string, paragraphIndex: number) => boolean;
  togglePara: (articleId: string, articleTitle: string, paragraphIndex: number, excerpt: string) => void;
  removePara: (id: string) => void;
};

const BookmarkCtx = createContext<Ctx | null>(null);
const KEY = "folio-bookmarks-v1";
const PARA_KEY = "folio-para-bookmarks-v1";

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [paraBookmarks, setParaBookmarks] = useState<ParagraphBookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
      const paraRaw = localStorage.getItem(PARA_KEY);
      if (paraRaw) setParaBookmarks(JSON.parse(paraRaw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  }, [ids, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(PARA_KEY, JSON.stringify(paraBookmarks)); } catch {}
  }, [paraBookmarks, hydrated]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );
  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), []);

  const hasPara = useCallback(
    (articleId: string, paragraphIndex: number) =>
      paraBookmarks.some((b) => b.articleId === articleId && b.paragraphIndex === paragraphIndex),
    [paraBookmarks]
  );

  const togglePara = useCallback(
    (articleId: string, articleTitle: string, paragraphIndex: number, excerpt: string) => {
      setParaBookmarks((prev) => {
        const exists = prev.find((b) => b.articleId === articleId && b.paragraphIndex === paragraphIndex);
        if (exists) return prev.filter((b) => b.id !== exists.id);
        return [...prev, {
          id: `${articleId}-p${paragraphIndex}-${Date.now()}`,
          articleId,
          articleTitle,
          paragraphIndex,
          excerpt: excerpt.slice(0, 140),
          savedAt: Date.now(),
        }];
      });
    },
    []
  );

  const removePara = useCallback(
    (id: string) => setParaBookmarks((prev) => prev.filter((b) => b.id !== id)),
    []
  );

  return (
    <BookmarkCtx.Provider value={{ ids, has, toggle, remove, paraBookmarks, hasPara, togglePara, removePara }}>
      {children}
    </BookmarkCtx.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkCtx);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
