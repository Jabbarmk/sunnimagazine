# Gulf Sathyadhara — API Reference

**Base URL:** `https://smartflix.cloud`

All request/response bodies are JSON unless noted. Successful mutations return `{ "ok": true }`.

---

## Fast Listing Flow (magazines → articles)

Use these scoped endpoints so list screens stay tiny and fast. **Never call `GET /api/articles` with no query** — that returns every article with full base64 images (~15 MB). Always use `list=1` and/or `magazineId`.

| Step | Endpoint | Payload | Notes |
|---|---|---|---|
| 1. Magazine list | `GET /api/magazines` (`?all=1` for drafts) | ~1 MB | Includes `articleCount` — no article fetch needed |
| 2. Articles in a magazine | `GET /api/articles?list=1&magazineId=<id>` | ~KB | Light: `id, title, category, author, date`, no images |
| 3. Full article (on open) | `GET /api/articles/<id>` | full | Only the one article's images/body load |

Light list variants:
- `GET /api/articles?list=1` — all articles, light (for global lists/counts).
- `GET /api/articles?magazineId=<id>` — full articles for one magazine (reader view).

Articles are ordered by id ascending (`a1, a2, a11…`, smallest first).

---

## Table of Contents

- [Authentication](#authentication)
- [App Users](#app-users)
- [User Subscriptions](#user-subscriptions)
- [Magazines](#magazines)
- [Articles](#articles)
- [News](#news)
- [News Categories](#news-categories)
- [Events](#events)
- [Videos](#videos)
- [Video Categories](#video-categories)
- [Arts](#arts)
- [Art Categories](#art-categories)
- [User Writings](#user-writings)
- [Authors](#authors)
- [Categories](#categories)
- [Slides](#slides)
- [Galleries](#galleries)
- [Editorial](#editorial)
- [Ticker](#ticker)
- [Email Settings](#email-settings)

---

## Authentication

### Admin Login
`POST /api/auth`

| Field | Type | Required |
|---|---|---|
| `email` | string | ✓ |
| `password` | string | ✓ |

**Response:** `{ "ok": true }`
**Errors:** `401 { "error": "Invalid credentials" }`

---

### App User Login
`POST /api/app-login`

| Field | Type | Description |
|---|---|---|
| `identifier` | string | Email or mobile number |
| `password` | string | |

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "mobile": "string",
  "location": "string",
  "photo": "string",
  "subscriptionFrom": "string",
  "subscriptionTo": "string",
  "referredBy": "string",
  "referralMobile": "string"
}
```
**Errors:** `400 Required` · `401 Invalid credentials`

---

### App User Signup
`POST /api/app-signup`

| Field | Type | Required |
|---|---|---|
| `name` | string | ✓ |
| `email` | string | ✓ |
| `mobile` | string | |
| `emirates` | string | ✓ — one of the 7 UAE emirates or `Global` |

**Response:** `{ "ok": true, "id": "string" }`

Sends welcome email to user + notification to admin on success.

**Errors:** `400 Name and email are required` · `409 Email already registered` · `409 Mobile number already registered`

---

### App User Delete Account

`POST /api/app-delete-account`

Self-service account deletion for a signed-in app user. Soft delete — sets `deleted_at` and `is_active=0` so the user can no longer log in, while the admin still sees them in the deleted-users list. Allowed even if the user has an active subscription.

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |

**Response:** `{ "ok": true }`
**Errors:** `400 User id is required` · `404 User not found`

---

## App Users

### List Users
`GET /api/users`

| Query | Type | Description |
|---|---|---|
| `deleted` | `"1"` | Return soft-deleted users. Omit for active users. |

**Response:**
```json
[{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "mobile": "string",
  "location": "string",
  "photo": "string | null",
  "subscriptionFrom": "string",
  "subscriptionTo": "string",
  "referredBy": "string",
  "referralMobile": "string",
  "isActive": "boolean",
  "deletedAt": "string | null"
}]
```

---

### Create / Update User
`POST /api/users`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `name` | string | ✓ |
| `email` | string | ✓ |
| `password` | string | |
| `mobile` | string | |
| `location` | string | |
| `photo` | string \| null | |
| `subscriptionFrom` | string \| null | |
| `subscriptionTo` | string \| null | |
| `referredBy` | string \| null | |
| `referralMobile` | string \| null | |

**Errors:** `409 Email already registered` · `409 Mobile number already registered`

---

### Update User
`PUT /api/users/[id]`

**Activate / deactivate:**
```json
{ "isActive": true }
```

**Soft delete:**
```json
{ "softDelete": true }
```
Blocked if subscription is still active. Error: `400 Cannot delete user with active subscription. Subscription expires {date}`

**Update subscription dates:**
```json
{ "subscriptionFrom": "string | null", "subscriptionTo": "string | null" }
```

---

### Hard Delete User
`DELETE /api/users/[id]`

---

## Other Magazines

Standalone magazines (cover + details + PDF, **not** tied to articles). Shown on the app home below Old Prints; tapping a cover opens the PDF in an in-app viewer.

### List
`GET /api/other-magazines`

Ordered by `sortOrder ASC`, then `created_at DESC`.
```json
[{
  "id": "string",
  "title": "string",
  "details": "string",
  "cover": "string",       // base64 image or URL
  "pdfUrl": "string",      // /uploads/pdfs/xxx.pdf
  "issueDate": "string",
  "sortOrder": "number"
}]
```

### Create / Update
`POST /api/other-magazines`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `title` | string | ✓ |
| `details` | string | |
| `cover` | string | |
| `pdfUrl` | string | ✓ (from the upload endpoint) |
| `issueDate` | string | |
| `sortOrder` | number | Default `0` |

### Upload PDF
`POST /api/other-magazines/upload` · `multipart/form-data`, field `file`

Max 50 MB, PDF only. **Response:** `{ "url": "/uploads/pdfs/mag_xxx.pdf" }`

### Delete
`DELETE /api/other-magazines/[id]`

---

## User Subscriptions

### List Subscriptions
`GET /api/user-subscriptions?userId={id}`

**Response:**
```json
[{
  "id": "string",
  "userId": "string",
  "amountAed": "number",
  "fromMonth": "string (YYYY-MM)",
  "toMonth": "string (YYYY-MM)",
  "paidDate": "string | null",
  "createdAt": "string"
}]
```

---

### Create / Update Subscription
`POST /api/user-subscriptions`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `userId` | string | ✓ |
| `amountAed` | number | ✓ |
| `fromMonth` | string (YYYY-MM) | ✓ |
| `toMonth` | string (YYYY-MM) | ✓ |
| `paidDate` | string \| null | |

Also syncs `subscriptionFrom` / `subscriptionTo` on the user record.

---

### Delete Subscription
`DELETE /api/user-subscriptions/[id]`

---

## Magazines

### List Magazines
`GET /api/magazines`

| Query | Type | Description |
|---|---|---|
| `all` | `"1"` | Include unpublished. Omit for published only. |

Ordered by year DESC then month (December → January).

**Response:**
```json
[{
  "id": "string",
  "title": "string",
  "month": "string",
  "year": "number",
  "cover": "string",
  "description": "string",
  "articleIds": ["string"],
  "isPublished": "boolean",
  "articleCount": "number",
  "created_at": "string"
}]
```

`articleCount` is computed in SQL — list views get counts without fetching any articles.

---

### Get Magazine
`GET /api/magazines/[id]`

Returns single object or `404 { "error": "Not found" }`.

---

### Create / Update Magazine
`POST /api/magazines`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `title` | string | ✓ |
| `month` | string | ✓ |
| `year` | number | ✓ |
| `cover` | string | ✓ |
| `description` | string | |
| `articleIds` | string[] | |
| `isPublished` | boolean | |

---

### Publish / Unpublish Magazine
`PUT /api/magazines/[id]`
```json
{ "isPublished": true }
```

---

### Delete Magazine
`DELETE /api/magazines/[id]`

---

## Articles

### List Articles
`GET /api/articles`

Ordered by article id ascending (smallest number first, e.g. `a1`, `a2`, `a11`).

| Query | Type | Description |
|---|---|---|
| `magazineId` | string | Filter to a single magazine's articles (server-side). Omit for all. |
| `list` | `"1"` | Light mode — returns only `id`, `magazineId`, `title`, `category`, `author`, `date` (no images or paragraph bodies). Use for list/table views. |

Combine both, e.g. `GET /api/articles?magazineId=m3&list=1`.

**Response:**
```json
[{
  "id": "string",
  "magazineId": "string",
  "title": "string",
  "caption": "string",
  "category": "string",
  "author": "string",
  "avatar": "string",
  "date": "string",
  "readTime": "number",
  "hero": "string",
  "paragraphs": ["string"],
  "inlineImage": "string | null",
  "inlineImage2": "string | null",
  "bottomImage": "string | null",
  "pullQuotes": [{ "text": "string", "afterParagraph": "number" }],
  "created_at": "string"
}]
```

---

### Get Article
`GET /api/articles/[id]`

Returns single object or `404 { "error": "Not found" }`.

---

### Create / Update Article
`POST /api/articles`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `originalId` | string | When editing, the article's current id. If it differs from `id`, the article is renamed (primary key moved) and references in galleries + magazines are updated. |
| `magazineId` | string | ✓ |
| `title` | string | ✓ |
| `caption` | string | |
| `category` | string | |
| `author` | string | |
| `avatar` | string | |
| `date` | string | |
| `readTime` | number | |
| `hero` | string | |
| `paragraphs` | string[] | |
| `inlineImage` | string \| null | |
| `inlineImage2` | string \| null | |
| `bottomImage` | string \| null | |
| `pullQuotes` | `[{ text, afterParagraph }]` | |

**Errors:** `409 Article ID already in use` (when renaming to an id that already exists)

---

### Delete Article
`DELETE /api/articles/[id]`

---

## News

### List News
`GET /api/news`

Ordered by `created_at DESC`.

**Response:**
```json
[{
  "id": "string",
  "categoryId": "string",
  "categoryName": "string",
  "title": "string",
  "description": "string",
  "image": "string",
  "source": "string",
  "publishedAt": "string"
}]
```

---

### Get News Item
`GET /api/news/[id]`

Returns single object or `404 { "error": "Not found" }`.

---

### Create / Update News
`POST /api/news`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `categoryId` | string | ✓ |
| `categoryName` | string | ✓ |
| `title` | string | ✓ |
| `description` | string | |
| `image` | string | |
| `source` | string | |
| `publishedAt` | string | |

---

### Delete News
`DELETE /api/news/[id]`

---

## News Categories

### List
`GET /api/news-categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/news-categories`
```json
{ "id": "string", "name": "string" }
```

### Delete
`DELETE /api/news-categories/[id]`

---

## Events

### List Events
`GET /api/events`

Ordered by `created_at DESC`.

**Response:**
```json
[{
  "id": "string",
  "title": "string",
  "description": "string",
  "poster": "string",
  "eventDate": "string"
}]
```

---

### Get Event
`GET /api/events/[id]`

Returns single object or `404 { "error": "Not found" }`.

---

### Create / Update Event
`POST /api/events`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `title` | string | ✓ |
| `description` | string | |
| `poster` | string | |
| `eventDate` | string | |

---

### Delete Event
`DELETE /api/events/[id]`

---

## Videos

### List Videos
`GET /api/videos`

Ordered by `created_at DESC`.

**Response:**
```json
[{
  "id": "string",
  "categoryId": "string",
  "categoryName": "string",
  "caption": "string",
  "link": "string",
  "created_at": "string"
}]
```

---

### Create / Update Video
`POST /api/videos`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `categoryId` | string | ✓ |
| `categoryName` | string | ✓ |
| `caption` | string | |
| `link` | string | ✓ |

---

### Delete Video
`DELETE /api/videos/[id]`

---

### Upload Video File
`POST /api/videos/upload`

Content-Type: `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | Video file (max 50 MB, must be `video/*`) |

**Response:** `{ "url": "/uploads/videos/vid_xxx.mp4" }`

**Errors:** `400 No file provided` · `400 File exceeds 50MB limit` · `400 Only video files are allowed` · `500 Upload failed`

---

## Video Categories

### List
`GET /api/video-categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/video-categories`
```json
{ "id": "string", "name": "string" }
```

### Delete
`DELETE /api/video-categories/[id]`

---

## Arts

### List Arts
`GET /api/arts`

Ordered by `created_at DESC`.

**Response:**
```json
[{
  "id": "string",
  "magazineId": "string",
  "artCategoryId": "string",
  "artCategoryName": "string",
  "authorId": "string | null",
  "authorName": "string | null",
  "authorAvatar": "string | null",
  "title": "string",
  "image": "string | null",
  "description": "string | null",
  "created_at": "string"
}]
```

---

### Create / Update Art
`POST /api/arts`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `magazineId` | string | ✓ |
| `artCategoryId` | string | ✓ |
| `artCategoryName` | string | ✓ |
| `title` | string | ✓ |
| `authorId` | string \| null | |
| `authorName` | string \| null | |
| `authorAvatar` | string \| null | |
| `image` | string \| null | |
| `description` | string \| null | |

---

### Delete Art
`DELETE /api/arts/[id]`

---

## Art Categories

### List
`GET /api/art-categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/art-categories`
```json
{ "id": "string", "name": "string" }
```

### Delete
`DELETE /api/art-categories/[id]`

---

## User Writings

### List Writings
`GET /api/user-writings`

Ordered by `sent_at DESC`.

**Response:**
```json
[{
  "id": "string",
  "name": "string",
  "email": "string",
  "artCategoryId": "string",
  "artCategoryName": "string",
  "description": "string",
  "image": "string | null",
  "sentAt": "string",
  "status": "pending | reviewed | published"
}]
```

---

### Submit Writing
`POST /api/user-writings`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `name` | string | ✓ |
| `email` | string | ✓ |
| `artCategoryId` | string | ✓ |
| `artCategoryName` | string | ✓ |
| `description` | string | ✓ |
| `image` | string \| null | Base64 image |
| `sentAt` | string | ISO date string |
| `status` | string | Default: `"pending"` |

Sends notification email to admin + confirmation to submitter.

---

### Update Writing Status
`PUT /api/user-writings/[id]`
```json
{ "status": "pending | reviewed | published" }
```

---

### Delete Writing
`DELETE /api/user-writings/[id]`

---

## Authors

### List
`GET /api/authors` → `[{ "id": "string", "name": "string", "avatar": "string" }]`

### Create / Update
`POST /api/authors`
```json
{ "id": "string", "name": "string", "avatar": "string" }
```

### Delete
`DELETE /api/authors/[id]`

---

## Categories

### List
`GET /api/categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/categories`
```json
{ "id": "string", "name": "string" }
```

### Delete
`DELETE /api/categories/[id]`

---

## Slides

### List Slides
`GET /api/slides`

Ordered by `sort_order ASC`, then `created_at DESC`.

| Query | Type | Description |
|---|---|---|
| `userId` | string | Filter slides to the user's emirate (+ `Global`). Omit (dashboard) to return all. |

Each slide has an `emirates` field (`Global` = shown to everyone). `news`, `events`, and `app_users` also carry an `emirates` field. News/events are filtered per-user client-side; slides are filtered server-side via `userId`.

**Response:**
```json
[{
  "id": "string",
  "image": "string",
  "poster": "string | null",
  "title": "string",
  "details": "string",
  "website": "string",
  "contact": "string",
  "sort_order": "number",
  "created_at": "string"
}]
```

---

### Get Slide
`GET /api/slides/[id]`

Returns single object or `404 { "error": "Not found" }`.

---

### Create / Update Slide
`POST /api/slides`

| Field | Type | Required |
|---|---|---|
| `id` | string | ✓ |
| `image` | string | ✓ |
| `poster` | string \| null | |
| `title` | string | |
| `details` | string | |
| `website` | string | |
| `contact` | string | |
| `sortOrder` | number | Default: `0` |

---

### Delete Slide
`DELETE /api/slides/[id]`

---

## Galleries

### List Galleries
`GET /api/galleries`

| Query | Type | Description |
|---|---|---|
| `articleId` | string | Filter by article. Returns `[{ "id", "url" }]` only. |

Without filter returns `[{ "id", "article_id", "url" }]`.

---

### Create / Update Gallery Item
`POST /api/galleries`
```json
{ "id": "string", "articleId": "string", "url": "string" }
```

---

### Delete Gallery Item
`DELETE /api/galleries/[id]`

---

## Editorial

### Get Editorial
`GET /api/editorial`

| Query | Type | Description |
|---|---|---|
| `magazineId` | string | Get editorial for a specific magazine. Falls back to global if not found. Omit to get most recently updated per-magazine editorial (falls back to global). |

**Response:** Editorial data object merged with defaults.

---

### Save Editorial
`POST /api/editorial`

| Field | Type | Description |
|---|---|---|
| `magazineId` | string \| null | `null` saves as global editorial |
| `...fields` | any | Editorial content fields |

**Errors:** `500 { "error": "..." }`

---

## Ticker

### Get Ticker
`GET /api/ticker`

**Response:** `{ "text": "string", "isEnabled": "boolean" }`

---

### Update Ticker
`POST /api/ticker`
```json
{ "text": "string", "isEnabled": true }
```

---

## Email Settings

### Get Settings
`GET /api/email-settings`

**Response:**
```json
{
  "host": "string",
  "port": "string",
  "username": "string",
  "password": "string",
  "fromName": "string",
  "adminEmail": "string",
  "whatsappTemplate": "string",
  "signupEmailTemplate": "string"
}
```

---

### Save Settings
`POST /api/email-settings`

Same shape as GET response.

`signupEmailTemplate` supports placeholders: `{name}`, `{email}`, `{mobile}`
