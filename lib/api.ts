// Async API client — replaces all localStorage store functions

const base = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "");

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${base}/api${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function post(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${base}/api${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${base}/api${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
}

async function put(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${base}/api${path}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
}

// ── Articles ──────────────────────────────────────────────
export const getArticles = () => get<any[]>("/articles");
export const getArticle = (id: string) => get<any>(`/articles/${id}`);
export const saveArticle = (a: any) => post("/articles", a);
export const deleteArticle = (id: string) => del(`/articles/${id}`);

// ── Magazines ─────────────────────────────────────────────
export const getMagazines = () => get<any[]>("/magazines");
export const getMagazine = (id: string) => get<any>(`/magazines/${id}`);
export const saveMagazine = (m: any) => post("/magazines", m);
export const deleteMagazine = (id: string) => del(`/magazines/${id}`);

// ── Categories ────────────────────────────────────────────
export const getCategories = () => get<any[]>("/categories");
export const saveCategory = (c: any) => post("/categories", c);
export const deleteCategory = (id: string) => del(`/categories/${id}`);

// ── Authors ───────────────────────────────────────────────
export const getAuthors = () => get<any[]>("/authors");
export const saveAuthor = (a: any) => post("/authors", a);
export const deleteAuthor = (id: string) => del(`/authors/${id}`);

// ── Slides ────────────────────────────────────────────────
export const getSlides = () => get<any[]>("/slides");
export const getSlide = (id: string) => get<any>(`/slides/${id}`);
export const saveSlide = (s: any) => post("/slides", s);
export const deleteSlide = (id: string) => del(`/slides/${id}`);

// ── Galleries ─────────────────────────────────────────────
export const getGallery = (articleId: string) => get<any[]>(`/galleries?articleId=${articleId}`);
export const saveGalleryImage = (g: any) => post("/galleries", g);
export const deleteGalleryImage = (id: string) => del(`/galleries/${id}`);

// ── Art Categories ────────────────────────────────────────
export const getArtCategories = () => get<any[]>("/art-categories");
export const saveArtCategory = (c: any) => post("/art-categories", c);
export const deleteArtCategory = (id: string) => del(`/art-categories/${id}`);

// ── Arts ──────────────────────────────────────────────────
export const getArts = () => get<any[]>("/arts");
export const saveArt = (a: any) => post("/arts", a);
export const deleteArt = (id: string) => del(`/arts/${id}`);

// ── App Users ─────────────────────────────────────────────
export const getAppUsers = () => get<any[]>("/users");
export const saveAppUser = (u: any) => post("/users", u);
export const deleteAppUser = (id: string) => del(`/users/${id}`);

// ── User Writings ─────────────────────────────────────────
export const getUserWritings = () => get<any[]>("/user-writings");
export const saveUserWriting = (w: any) => post("/user-writings", w);
export const updateUserWritingStatus = (id: string, status: string) => put(`/user-writings/${id}`, { status });
export const deleteUserWriting = (id: string) => del(`/user-writings/${id}`);

// ── Email Settings ────────────────────────────────────────
export const getEmailSettings = () => get<any>("/email-settings");
export const saveEmailSettings = (s: any) => post("/email-settings", s);

// ── Video Categories ──────────────────────────────────────
export const getVideoCategories = () => get<any[]>("/video-categories");
export const saveVideoCategory = (c: any) => post("/video-categories", c);
export const deleteVideoCategory = (id: string) => del(`/video-categories/${id}`);

// ── Videos ────────────────────────────────────────────────
export const getVideos = () => get<any[]>("/videos");
export const saveVideo = (v: any) => post("/videos", v);
export const deleteVideo = (id: string) => del(`/videos/${id}`);

// ── Auth ──────────────────────────────────────────────────
export async function loginAdmin(email: string, password: string): Promise<boolean> {
  const res = await fetch("/api/auth", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.ok) {
    localStorage.setItem("gs_auth_v1", "auth");
    return true;
  }
  return false;
}
