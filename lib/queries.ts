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
    emirates: r.emirates ?? "Global",
  }));
}

export async function getEventsDB(): Promise<EventItem[]> {
  const [rows] = await db.query("SELECT * FROM events ORDER BY created_at DESC");
  return (rows as any[]).map((r) => ({
    id: r.id, title: r.title, description: r.description,
    poster: r.poster, eventDate: r.event_date,
    emirates: r.emirates ?? "Global",
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

export async function getEventDB(id: string): Promise<EventItem | null> {
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE id=?", [id]);
    const r = (rows as any[])[0];
    if (!r) return null;
    return { id: r.id, title: r.title, description: r.description, poster: r.poster, eventDate: r.event_date };
  } catch {
    return null;
  }
}

export async function getOtherMagazinesDB(limit = 5): Promise<any[]> {
  try {
    const [rows] = await db.query(
      "SELECT * FROM other_magazines ORDER BY sort_order ASC, created_at DESC LIMIT ?",
      [limit]
    );
    return (rows as any[]).map((r) => ({
      id: r.id, title: r.title, details: r.details, cover: r.cover,
      pdfUrl: r.pdf_url, issueDate: r.issue_date,
    }));
  } catch {
    return [];
  }
}

export async function getWingsCategoriesDB(limit = 5): Promise<any[]> {
  try {
    const [rows] = await db.query(
      `SELECT c.*, (SELECT COUNT(*) FROM wings w WHERE w.category_id = c.id) AS item_count
       FROM wings_categories c ORDER BY c.sort_order ASC, c.created_at DESC LIMIT ?`,
      [limit]
    );
    return (rows as any[]).map((r) => ({
      id: r.id, name: r.name, image: r.image, itemCount: Number(r.item_count) || 0,
    }));
  } catch {
    return [];
  }
}

export async function getWingsCategoryDB(id: string): Promise<any | null> {
  try {
    const [rows] = await db.query("SELECT * FROM wings_categories WHERE id=?", [id]);
    const r = (rows as any[])[0];
    return r ? { id: r.id, name: r.name, image: r.image } : null;
  } catch {
    return null;
  }
}

export async function getWingsByCategoryDB(categoryId: string): Promise<any[]> {
  try {
    const [rows] = await db.query(
      "SELECT * FROM wings WHERE category_id=? ORDER BY sort_order ASC, created_at DESC",
      [categoryId]
    );
    const wings = rows as any[];
    const ids = wings.map((w) => w.id);
    let imagesByWing: Record<string, string[]> = {};
    if (ids.length) {
      const [imgRows] = await db.query(
        `SELECT wing_id, url FROM wings_images WHERE wing_id IN (${ids.map(() => "?").join(",")}) ORDER BY sort_order ASC`,
        ids
      );
      for (const r of imgRows as any[]) {
        (imagesByWing[r.wing_id] ??= []).push(r.url);
      }
    }
    return wings.map((w) => ({
      id: w.id, categoryId: w.category_id, caption: w.caption, description: w.description,
      images: imagesByWing[w.id] || [],
    }));
  } catch {
    return [];
  }
}

export async function getWingDB(id: string): Promise<any | null> {
  try {
    const [rows] = await db.query("SELECT * FROM wings WHERE id=?", [id]);
    const w = (rows as any[])[0];
    if (!w) return null;
    const [imgRows] = await db.query(
      "SELECT url FROM wings_images WHERE wing_id=? ORDER BY sort_order ASC",
      [id]
    );
    return {
      id: w.id, categoryId: w.category_id, caption: w.caption, description: w.description,
      images: (imgRows as any[]).map((r) => r.url),
    };
  } catch {
    return null;
  }
}

export async function getNewsCategoriesDB(): Promise<{ id: string; name: string }[]> {
  const [rows] = await db.query("SELECT * FROM news_categories ORDER BY name");
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
