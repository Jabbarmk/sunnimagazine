import { articles as seedArticles, magazines as seedMagazines } from "./data";
import type { Article, Magazine } from "./data";

const ART_KEY = "gs_articles_v1";
const MAG_KEY = "gs_magazines_v1";

function readJSON<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function getArticles(): Article[] {
  return readJSON(ART_KEY, seedArticles);
}

export function getArticle(id: string): Article | undefined {
  return getArticles().find((a) => a.id === id);
}

export function saveArticle(article: Article): void {
  const all = getArticles();
  const idx = all.findIndex((a) => a.id === article.id);
  if (idx >= 0) all[idx] = article;
  else all.unshift(article);
  writeJSON(ART_KEY, all);
}

export function deleteArticle(id: string): void {
  writeJSON(ART_KEY, getArticles().filter((a) => a.id !== id));
}

export function getMagazines(): Magazine[] {
  return readJSON(MAG_KEY, seedMagazines);
}

export function getMagazine(id: string): Magazine | undefined {
  return getMagazines().find((m) => m.id === id);
}

export function saveMagazine(magazine: Magazine): void {
  const all = getMagazines();
  const idx = all.findIndex((m) => m.id === magazine.id);
  if (idx >= 0) all[idx] = magazine;
  else all.unshift(magazine);
  writeJSON(MAG_KEY, all);
}

export function deleteMagazine(id: string): void {
  writeJSON(MAG_KEY, getMagazines().filter((m) => m.id !== id));
}

export function resetStore(): void {
  localStorage.removeItem(ART_KEY);
  localStorage.removeItem(MAG_KEY);
}
