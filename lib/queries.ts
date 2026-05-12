import db from "@/lib/db";
import type { Magazine } from "@/lib/data";
import type { NewsItem, EventItem, Video, VideoCategory, Art } from "@/lib/store";

export async function getMagazinesDB(): Promise<Magazine[]> {
  const [rows] = await db.query(
    `SELECT * FROM magazines WHERE is_published=1 ORDER BY year DESC, FIELD(month,'December','November','October','September','August','July','June','May','April','March','February','January')`
  );
  return (rows as any[]).map((r) => ({
    ...r, articleIds: JSON.parse(r.article_ids || "[]"), isPublished: !!r.is_published,
  }));
}

export async function getNewsDB(): Promise<NewsItem[]> {
  const [rows] = await db.query("SELECT * FROM news ORDER BY created_at DESC");
  return (rows as any[]).map((r) => ({
    id: r.id, categoryId: r.category_id, categoryName: r.category_name,
    title: r.title, description: r.description, image: r.image,
    source: r.source, publishedAt: r.published_at,
  }));
}

export async function getEventsDB(): Promise<EventItem[]> {
  const [rows] = await db.query("SELECT * FROM events ORDER BY created_at DESC");
  return (rows as any[]).map((r) => ({
    id: r.id, title: r.title, description: r.description,
    poster: r.poster, eventDate: r.event_date,
  }));
}

export async function getTickerDB(): Promise<{ text: string; isEnabled: boolean }> {
  try {
    const [rows] = await db.query("SELECT * FROM ticker WHERE id=1");
    const r = (rows as any[])[0];
    if (!r) return { text: "", isEnabled: false };
    return { text: r.text ?? "", isEnabled: r.is_enabled === 1 };
  } catch {
    return { text: "", isEnabled: false };
  }
}

export async function getVideosDB(): Promise<Video[]> {
  const [rows] = await db.query("SELECT * FROM videos ORDER BY created_at DESC");
  return (rows as any[]).map((r) => ({
    ...r, categoryId: r.category_id, categoryName: r.category_name,
  }));
}

export async function getVideoCategoriesDB(): Promise<VideoCategory[]> {
  const [rows] = await db.query("SELECT * FROM video_categories");
  return rows as any[];
}

export async function getArtsDB(): Promise<Art[]> {
  const [rows] = await db.query("SELECT * FROM arts ORDER BY created_at DESC");
  return (rows as any[]).map((r) => ({
    ...r, magazineId: r.magazine_id, artCategoryId: r.art_category_id,
    artCategoryName: r.art_category_name, authorId: r.author_id,
    authorName: r.author_name, authorAvatar: r.author_avatar,
  }));
}
