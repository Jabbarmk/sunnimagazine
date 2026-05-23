# Gulf Sathyadhara — API Reference

Base URL: `https://smartflix.cloud`

All requests and responses use JSON unless noted. Successful mutations return `{ "ok": true }`.

---

## Authentication

### Admin Login
`POST /api/auth`
```json
{ "email": "string", "password": "string" }
```
Returns `{ "ok": true }` or `401 { "error": "Invalid credentials" }`.

### App User Login
`POST /api/app-login`
```json
{ "identifier": "string (email or mobile)", "password": "string" }
```
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
Errors: `400 { "error": "Required" }` · `401 { "error": "Invalid credentials" }`

### App User Signup
`POST /api/app-signup`
```json
{ "name": "string", "email": "string", "mobile": "string (optional)" }
```
**Response:** `{ "ok": true, "id": "string" }`

Triggers welcome email to user and notification to admin.

Errors: `400 Required` · `409 Email already registered` · `409 Mobile number already registered`

---

## Magazines

### List Magazines
`GET /api/magazines`

| Query | Type | Description |
|---|---|---|
| `all` | `"1"` | Include unpublished. Omit for published only. |

**Response:**
```json
[{
  "id": "string",
  "title": "string",
  "month": "string",
  "year": "number",
  "cover": "string (base64 or URL)",
  "description": "string",
  "articleIds": ["string"],
  "isPublished": "boolean",
  "created_at": "string"
}]
```

### Get Magazine
`GET /api/magazines/[id]` → single object or `404 { "error": "Not found" }`

### Create / Update Magazine
`POST /api/magazines`
```json
{
  "id": "string",
  "title": "string",
  "month": "string",
  "year": "number",
  "cover": "string",
  "description": "string",
  "articleIds": ["string"],
  "isPublished": "boolean"
}
```

### Publish / Unpublish Magazine
`PUT /api/magazines/[id]`
```json
{ "isPublished": true }
```

### Delete Magazine
`DELETE /api/magazines/[id]`

---

## Articles

### List Articles
`GET /api/articles`

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

### Get Article
`GET /api/articles/[id]` → single object or `404`

### Create / Update Article
`POST /api/articles`
```json
{
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
  "pullQuotes": [{ "text": "string", "afterParagraph": "number" }]
}
```

### Delete Article
`DELETE /api/articles/[id]`

---

## News

### List News
`GET /api/news`

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

### Get News Item
`GET /api/news/[id]` → single object or `404`

### Create / Update News
`POST /api/news`
```json
{
  "id": "string",
  "categoryId": "string",
  "categoryName": "string",
  "title": "string",
  "description": "string",
  "image": "string",
  "source": "string",
  "publishedAt": "string"
}
```

### Delete News
`DELETE /api/news/[id]`

---

## News Categories

### List
`GET /api/news-categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/news-categories` `{ "id": "string", "name": "string" }`

### Delete
`DELETE /api/news-categories/[id]`

---

## Events

### List Events
`GET /api/events`

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

### Get Event
`GET /api/events/[id]` → single object or `404`

### Create / Update Event
`POST /api/events`
```json
{ "id": "string", "title": "string", "description": "string", "poster": "string", "eventDate": "string" }
```

### Delete Event
`DELETE /api/events/[id]`

---

## Videos

### List Videos
`GET /api/videos`

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

### Create / Update Video
`POST /api/videos`
```json
{ "id": "string", "categoryId": "string", "categoryName": "string", "caption": "string", "link": "string" }
```

### Delete Video
`DELETE /api/videos/[id]`

### Upload Video File
`POST /api/videos/upload` — `multipart/form-data` with `file` field

- Max size: 50 MB
- Must be a video MIME type

**Response:** `{ "url": "string" }`

Errors: `400 No file provided` · `400 File exceeds 50MB limit` · `400 Only video files are allowed`

---

## Video Categories

### List
`GET /api/video-categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/video-categories` `{ "id": "string", "name": "string" }`

### Delete
`DELETE /api/video-categories/[id]`

---

## Arts

### List Arts
`GET /api/arts`

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

### Create / Update Art
`POST /api/arts`
```json
{
  "id": "string",
  "magazineId": "string",
  "artCategoryId": "string",
  "artCategoryName": "string",
  "authorId": "string | null",
  "authorName": "string | null",
  "authorAvatar": "string | null",
  "title": "string",
  "image": "string | null",
  "description": "string | null"
}
```

### Delete Art
`DELETE /api/arts/[id]`

---

## Art Categories

### List
`GET /api/art-categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/art-categories` `{ "id": "string", "name": "string" }`

### Delete
`DELETE /api/art-categories/[id]`

---

## User Writings

### List Writings
`GET /api/user-writings`

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

### Submit Writing
`POST /api/user-writings`
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "artCategoryId": "string",
  "artCategoryName": "string",
  "description": "string",
  "image": "string | null (base64)",
  "sentAt": "string (ISO date)",
  "status": "pending"
}
```
Triggers email to admin and confirmation to submitter.

### Update Writing Status
`PUT /api/user-writings/[id]`
```json
{ "status": "pending | reviewed | published" }
```

### Delete Writing
`DELETE /api/user-writings/[id]`

---

## App Users

### List Users
`GET /api/users`

| Query | Type | Description |
|---|---|---|
| `deleted` | `"1"` | List soft-deleted users. Omit for active users. |

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

### Create / Update User
`POST /api/users`
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "mobile": "string",
  "location": "string",
  "photo": "string | null",
  "subscriptionFrom": "string | null",
  "subscriptionTo": "string | null",
  "referredBy": "string | null",
  "referralMobile": "string | null"
}
```
Errors: `409 Email already registered` · `409 Mobile number already registered`

### Update User
`PUT /api/users/[id]`

Activate / deactivate:
```json
{ "isActive": true }
```
Soft delete:
```json
{ "softDelete": true }
```
Update subscription dates:
```json
{ "subscriptionFrom": "string | null", "subscriptionTo": "string | null" }
```
Error: `400 Cannot delete user with active subscription. Subscription expires {date}`

### Hard Delete User
`DELETE /api/users/[id]`

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

### Create / Update Subscription
`POST /api/user-subscriptions`
```json
{
  "id": "string",
  "userId": "string",
  "amountAed": "number",
  "fromMonth": "string (YYYY-MM)",
  "toMonth": "string (YYYY-MM)",
  "paidDate": "string | null"
}
```
Also syncs `subscriptionFrom` / `subscriptionTo` on the user record.

### Delete Subscription
`DELETE /api/user-subscriptions/[id]`

---

## Authors

### List
`GET /api/authors` → `[{ "id": "string", "name": "string", "avatar": "string" }]`

### Create / Update
`POST /api/authors` `{ "id": "string", "name": "string", "avatar": "string" }`

### Delete
`DELETE /api/authors/[id]`

---

## Categories

### List
`GET /api/categories` → `[{ "id": "string", "name": "string" }]`

### Create / Update
`POST /api/categories` `{ "id": "string", "name": "string" }`

### Delete
`DELETE /api/categories/[id]`

---

## Slides

### List Slides
`GET /api/slides` → array ordered by `sort_order`

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

### Get Slide
`GET /api/slides/[id]` → single object or `404`

### Create / Update Slide
`POST /api/slides`
```json
{
  "id": "string",
  "image": "string",
  "poster": "string | null",
  "title": "string",
  "details": "string",
  "website": "string",
  "contact": "string",
  "sortOrder": "number"
}
```

### Delete Slide
`DELETE /api/slides/[id]`

---

## Galleries

### List Galleries
`GET /api/galleries`

| Query | Type | Description |
|---|---|---|
| `articleId` | string | Filter by article. Returns `[{ "id", "url" }]` |

Without filter returns `[{ "id", "article_id", "url" }]`.

### Create / Update
`POST /api/galleries` `{ "id": "string", "articleId": "string", "url": "string" }`

### Delete
`DELETE /api/galleries/[id]`

---

## Editorial

### Get Editorial
`GET /api/editorial`

| Query | Type | Description |
|---|---|---|
| `magazineId` | string | Get editorial for specific magazine. Omit for global. |

### Create / Update Editorial
`POST /api/editorial`
```json
{ "magazineId": "string | null", "...fields": "..." }
```

---

## Ticker

### Get Ticker
`GET /api/ticker` → `{ "text": "string", "isEnabled": "boolean" }`

### Update Ticker
`POST /api/ticker` `{ "text": "string", "isEnabled": "boolean" }`

---

## Email Settings

### Get Settings
`GET /api/email-settings`
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

### Save Settings
`POST /api/email-settings` — same shape as GET response.

`signupEmailTemplate` supports `{name}`, `{email}`, `{mobile}` placeholders.
