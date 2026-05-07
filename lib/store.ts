import { articles as seedArticles, magazines as seedMagazines } from "./data";
import type { Article, Magazine } from "./data";

export type Category = { id: string; name: string };
export type Author = { id: string; name: string; avatar: string };
export type Slide = { id: string; image: string; poster: string; title: string; details: string; website: string; contact: string };
export type GalleryImage = { id: string; url: string };
export type ArtCategory = { id: string; name: string };
export type Art = {
  id: string;
  magazineId: string;
  artCategoryId: string;
  artCategoryName: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  image: string;
  description: string;
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  mobile: string;
  location: string;
  photo: string;
  subscriptionFrom: string;
  subscriptionTo: string;
};

export type UserWriting = {
  id: string;
  name: string;
  email: string;
  artCategoryId: string;
  artCategoryName: string;
  description: string;
  image: string;
  sentAt: string;
  status: "pending" | "reviewed" | "published";
};

export type EmailSettings = {
  host: string;
  port: string;
  username: string;
  password: string;
  fromName: string;
  adminEmail: string;
};

const seedCategories: Category[] = [
  { id: "cat1", name: "ജാലകം" },
  { id: "cat2", name: "ഉപന്യാസം" },
  { id: "cat3", name: "കവിത" },
  { id: "cat4", name: "കഥ" },
];

export type VideoCategory = { id: string; name: string };
export type Video = {
  id: string;
  categoryId: string;
  categoryName: string;
  caption: string;
  link: string;
};

const ART_KEY = "gs_articles_v1";
const MAG_KEY = "gs_magazines_v1";
const CAT_KEY = "gs_categories_v1";
const AUTH_KEY = "gs_authors_v1";
const SLIDE_KEY = "gs_slides_v1";
const GALLERY_KEY = "gs_galleries_v1";
const ART_CAT_KEY = "gs_art_cats_v1";
const ARTS_KEY = "gs_arts_v1";
const USERS_KEY = "gs_users_v1";
const WRITINGS_KEY = "gs_writings_v1";
const EMAIL_KEY = "gs_email_v1";
const VIDEO_CAT_KEY = "gs_video_cats_v1";
const VIDEOS_KEY = "gs_videos_v1";

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
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      throw new Error("Storage full. Please remove some images to free up space.");
    }
    throw e;
  }
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

export function getCategories(): Category[] {
  return readJSON(CAT_KEY, seedCategories);
}

export function saveCategory(cat: Category): void {
  const all = getCategories();
  const idx = all.findIndex((c) => c.id === cat.id);
  if (idx >= 0) all[idx] = cat;
  else all.push(cat);
  writeJSON(CAT_KEY, all);
}

export function deleteCategory(id: string): void {
  writeJSON(CAT_KEY, getCategories().filter((c) => c.id !== id));
}

export function getAuthors(): Author[] {
  return readJSON(AUTH_KEY, []);
}

export function getAuthor(id: string): Author | undefined {
  return getAuthors().find((a) => a.id === id);
}

export function saveAuthor(author: Author): void {
  const all = getAuthors();
  const idx = all.findIndex((a) => a.id === author.id);
  if (idx >= 0) all[idx] = author;
  else all.push(author);
  writeJSON(AUTH_KEY, all);
}

export function deleteAuthor(id: string): void {
  writeJSON(AUTH_KEY, getAuthors().filter((a) => a.id !== id));
}

export function getSlides(): Slide[] {
  return readJSON(SLIDE_KEY, []);
}

export function getSlide(id: string): Slide | undefined {
  return getSlides().find((s) => s.id === id);
}

export function saveSlide(slide: Slide): void {
  const all = getSlides();
  const idx = all.findIndex((s) => s.id === slide.id);
  if (idx >= 0) all[idx] = slide;
  else all.push(slide);
  writeJSON(SLIDE_KEY, all);
}

export function deleteSlide(id: string): void {
  writeJSON(SLIDE_KEY, getSlides().filter((s) => s.id !== id));
}

export function getGallery(articleId: string): GalleryImage[] {
  const all = readJSON<{ articleId: string; images: GalleryImage[] }>(GALLERY_KEY, []);
  return all.find((g) => g.articleId === articleId)?.images ?? [];
}

export function saveGallery(articleId: string, images: GalleryImage[]): void {
  const all = readJSON<{ articleId: string; images: GalleryImage[] }>(GALLERY_KEY, []);
  const idx = all.findIndex((g) => g.articleId === articleId);
  if (idx >= 0) all[idx].images = images;
  else all.push({ articleId, images });
  writeJSON(GALLERY_KEY, all);
}

export function getGalleries(): { articleId: string; images: GalleryImage[] }[] {
  return readJSON(GALLERY_KEY, []);
}

export function getArtCategories(): ArtCategory[] { return readJSON(ART_CAT_KEY, []); }
export function saveArtCategory(c: ArtCategory): void {
  const all = getArtCategories();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c; else all.push(c);
  writeJSON(ART_CAT_KEY, all);
}
export function deleteArtCategory(id: string): void { writeJSON(ART_CAT_KEY, getArtCategories().filter((c) => c.id !== id)); }

export function getArts(): Art[] { return readJSON(ARTS_KEY, []); }
export function getArt(id: string): Art | undefined { return getArts().find((a) => a.id === id); }
export function saveArt(art: Art): void {
  const all = getArts();
  const idx = all.findIndex((a) => a.id === art.id);
  if (idx >= 0) all[idx] = art; else all.unshift(art);
  writeJSON(ARTS_KEY, all);
}
export function deleteArt(id: string): void { writeJSON(ARTS_KEY, getArts().filter((a) => a.id !== id)); }

export function getAppUsers(): AppUser[] { return readJSON(USERS_KEY, []); }
export function saveAppUser(u: AppUser): void {
  const all = getAppUsers();
  const idx = all.findIndex((x) => x.id === u.id);
  if (idx >= 0) all[idx] = u; else all.unshift(u);
  writeJSON(USERS_KEY, all);
}
export function deleteAppUser(id: string): void {
  writeJSON(USERS_KEY, getAppUsers().filter((u) => u.id !== id));
}

export function getUserWritings(): UserWriting[] { return readJSON(WRITINGS_KEY, []); }
export function saveUserWriting(w: UserWriting): void {
  const all = getUserWritings();
  const idx = all.findIndex((x) => x.id === w.id);
  if (idx >= 0) all[idx] = w; else all.unshift(w);
  writeJSON(WRITINGS_KEY, all);
}
export function deleteUserWriting(id: string): void {
  writeJSON(WRITINGS_KEY, getUserWritings().filter((w) => w.id !== id));
}

const EMPTY_EMAIL: EmailSettings = { host: "", port: "587", username: "", password: "", fromName: "", adminEmail: "" };
export function getEmailSettings(): EmailSettings {
  if (typeof window === "undefined") return EMPTY_EMAIL;
  try {
    const raw = localStorage.getItem(EMAIL_KEY);
    return raw ? { ...EMPTY_EMAIL, ...JSON.parse(raw) } : EMPTY_EMAIL;
  } catch { return EMPTY_EMAIL; }
}
export function saveEmailSettings(s: EmailSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(EMAIL_KEY, JSON.stringify(s));
}

export function getVideoCategories(): VideoCategory[] { return readJSON(VIDEO_CAT_KEY, []); }
export function saveVideoCategory(c: VideoCategory): void {
  const all = getVideoCategories();
  const idx = all.findIndex((x) => x.id === c.id);
  if (idx >= 0) all[idx] = c; else all.push(c);
  writeJSON(VIDEO_CAT_KEY, all);
}
export function deleteVideoCategory(id: string): void { writeJSON(VIDEO_CAT_KEY, getVideoCategories().filter((c) => c.id !== id)); }

export function getVideos(): Video[] { return readJSON(VIDEOS_KEY, []); }
export function saveVideo(v: Video): void {
  const all = getVideos();
  const idx = all.findIndex((x) => x.id === v.id);
  if (idx >= 0) all[idx] = v; else all.unshift(v);
  writeJSON(VIDEOS_KEY, all);
}
export function deleteVideo(id: string): void { writeJSON(VIDEOS_KEY, getVideos().filter((v) => v.id !== id)); }

export function resetStore(): void {
  localStorage.removeItem(ART_KEY);
  localStorage.removeItem(MAG_KEY);
  localStorage.removeItem(CAT_KEY);
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(SLIDE_KEY);
  localStorage.removeItem(GALLERY_KEY);
  localStorage.removeItem(ART_CAT_KEY);
  localStorage.removeItem(ARTS_KEY);
  localStorage.removeItem(WRITINGS_KEY);
}
