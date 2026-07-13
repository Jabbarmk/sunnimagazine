# Flutter — API Changes Guide

Covers three recent changes: **(1) lazy image loading**, **(2) Other Magazines**,
**(3) article sort order**. Base URL: `https://smartflix.cloud`.

> Recommended package for cached thumbnails: `cached_network_image`. The image
> endpoints send `Cache-Control: max-age=3600`, so images are fetched once and reused.

```yaml
# pubspec.yaml
dependencies:
  http: ^1.2.0
  cached_network_image: ^3.3.0
  url_launcher: ^6.2.0        # to open PDFs
```

```dart
class Api {
  static const String base = 'https://smartflix.cloud';
}
```

---

## 1) Lazy image loading (covers & article thumbnails)

**Why:** lists used to embed full base64 images (megabytes). Now list endpoints
return **no image bytes** — just a small URL you load lazily and cache.

### Magazine list + lazy cover
```
GET /api/magazines?list=1        # published, light (no covers). ?all=1&list=1 for drafts too
→ [{ id, title, month, year, description, articleIds, isPublished, articleCount, hasCover }]

GET /api/magazines/{id}/cover     # the cover as a cacheable JPEG
```
```dart
class MagazineLite {
  final String id, title, month;
  final int year, articleCount;
  final bool hasCover;
  MagazineLite.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        title = j['title'] ?? '',
        month = j['month'] ?? '',
        year = (j['year'] is int) ? j['year'] : int.tryParse('${j['year']}') ?? 0,
        articleCount = j['articleCount'] ?? 0,
        hasCover = j['hasCover'] ?? false;

  String get coverUrl => '${Api.base}/api/magazines/$id/cover';
}

// In a grid tile:
if (m.hasCover)
  CachedNetworkImage(imageUrl: m.coverUrl, fit: BoxFit.cover)
else
  const Icon(Icons.menu_book);
```

### Article list + lazy thumbnail (per magazine)
```
GET /api/articles?list=1&magazineId={id}
→ [{ id, magazineId, title, category, author, date, sortOrder, hasHero, thumbUrl }]

GET /api/articles/{id}/hero        # the hero image, cacheable
GET /api/articles/{id}             # full article (paragraphs + images) — open on tap
```
```dart
class ArticleLite {
  final String id, title, category, author, date;
  final bool hasHero;
  final String? thumbUrl;   // e.g. "/api/articles/May20265/hero" (relative)
  ArticleLite.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        title = j['title'] ?? '',
        category = j['category'] ?? '',
        author = j['author'] ?? '',
        date = j['date'] ?? '',
        hasHero = j['hasHero'] ?? false,
        thumbUrl = j['thumbUrl'];

  String? get thumb => thumbUrl == null ? null : '${Api.base}$thumbUrl';
}

// In a list row:
if (a.thumb != null)
  CachedNetworkImage(imageUrl: a.thumb!, width: 80, height: 64, fit: BoxFit.cover)
```

**Rule:** never call `GET /api/articles` with no query (returns all full articles ≈ 15 MB).
Always `?list=1&magazineId=…` for lists, `/{id}` for one full article.

---

## 2) Other Magazines (cover + PDF)

A new section on the home screen (below Old Prints): standalone magazines that
are just a **cover + details + PDF** (not tied to articles).

```
GET /api/other-magazines
→ [{ id, title, details, cover, pdfUrl, issueDate, sortOrder }]
```
- `cover` may be a full URL (e.g. picsum) or a base64 data URL — `CachedNetworkImage`
  handles URLs; for base64 use `Image.memory(base64Decode(...))` if you detect `data:`.
- `pdfUrl` is like `/uploads/pdfs/xxx.pdf` → prepend the base URL.

```dart
class OtherMag {
  final String id, title, details, cover, pdfUrl, issueDate;
  OtherMag.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        title = j['title'] ?? '',
        details = j['details'] ?? '',
        cover = j['cover'] ?? '',
        pdfUrl = j['pdfUrl'] ?? '',
        issueDate = j['issueDate'] ?? '';

  String get fullPdf => pdfUrl.startsWith('http') ? pdfUrl : '${Api.base}$pdfUrl';
}

Future<List<OtherMag>> getOtherMagazines() async {
  final res = await http.get(Uri.parse('${Api.base}/api/other-magazines'));
  return (jsonDecode(res.body) as List).map((e) => OtherMag.fromJson(e)).toList();
}

// Tap a cover → open the PDF:
import 'package:url_launcher/url_launcher.dart';
Future<void> openPdf(OtherMag m) async {
  await launchUrl(Uri.parse(m.fullPdf), mode: LaunchMode.externalApplication);
}
```
> `url_launcher` opens the PDF in the device's viewer (simplest, reliable).
> For an in-app viewer, use `syncfusion_flutter_pdfviewer` or `flutter_pdfview` with `m.fullPdf`.

---

## 3) Article sort order

Articles in a magazine are now ordered by an admin-controlled **`sort_order`**
(drag-and-drop in the dashboard), not by id.

**What to change in the app:** nothing to compute — just **render articles in the
order the API returns them**. If your code re-sorts articles (e.g. by id or date),
**remove that sort** so the admin's order is respected.

```dart
final res = await http.get(Uri.parse('${Api.base}/api/articles?list=1&magazineId=$magId'));
final list = (jsonDecode(res.body) as List).map((e) => ArticleLite.fromJson(e)).toList();
// ✅ already in the right order — do NOT list.sort(...)
```

The list also carries `sortOrder` if you ever need it, but you shouldn't have to.

---

## Summary of endpoints

| Purpose | Endpoint |
|---|---|
| Magazines (light) | `GET /api/magazines?list=1` |
| Magazine cover img | `GET /api/magazines/{id}/cover` |
| Articles in magazine (light + thumb) | `GET /api/articles?list=1&magazineId={id}` |
| Article thumbnail img | `GET /api/articles/{id}/hero` |
| Full article | `GET /api/articles/{id}` |
| Other Magazines | `GET /api/other-magazines` |
| PDF file | `{base}{pdfUrl}` |

All list endpoints are tiny (no image bytes); images load lazily and cache.
