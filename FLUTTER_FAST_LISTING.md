# Flutter — Fast Magazine/Article Listing

Ready-to-paste Dart for the fast listing flow against the Gulf Sathyadhara API.

**Base URL:** `https://smartflix.cloud`

---

## The flow (why it's fast)

| Step | Endpoint | Payload | Notes |
|---|---|---|---|
| 1. Magazine list | `GET /api/magazines` (`?all=1` for drafts) | ~1 MB | Includes `articleCount` — no article fetch needed |
| 2. Articles in a magazine | `GET /api/articles?list=1&magazineId=<id>` | ~KB | Light: `id, title, category, author, date`, **no images** |
| 3. Full article (on open) | `GET /api/articles/<id>` | full | Only that one article's images/body load |

**Rule:** never call `GET /api/articles` with no query — it returns every article with full base64 images (~15 MB). Always use `list=1` and/or `magazineId`.

Articles are ordered by id ascending (`a1, a2, a11…`, smallest first).

---

## `lib/api_service.dart`

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'https://smartflix.cloud';

  // 1) Magazine list — includes articleCount (no article fetch needed)
  static Future<List<Magazine>> getMagazines({bool all = false}) async {
    final url = Uri.parse('$baseUrl/api/magazines${all ? '?all=1' : ''}');
    final res = await http.get(url);
    if (res.statusCode != 200) throw Exception('Magazines failed: ${res.statusCode}');
    return (jsonDecode(res.body) as List).map((e) => Magazine.fromJson(e)).toList();
  }

  // 2) Articles inside a magazine — LIGHT list (no images/body), fast
  static Future<List<ArticleListItem>> getArticleList(String magazineId) async {
    final url = Uri.parse('$baseUrl/api/articles?list=1&magazineId=$magazineId');
    final res = await http.get(url);
    if (res.statusCode != 200) throw Exception('Article list failed: ${res.statusCode}');
    return (jsonDecode(res.body) as List).map((e) => ArticleListItem.fromJson(e)).toList();
  }

  // 3) Full article — only when the user opens one (loads its images/body)
  static Future<Article> getArticle(String id) async {
    final url = Uri.parse('$baseUrl/api/articles/$id');
    final res = await http.get(url);
    if (res.statusCode != 200) throw Exception('Article failed: ${res.statusCode}');
    return Article.fromJson(jsonDecode(res.body));
  }
}
```

---

## Models

```dart
class Magazine {
  final String id, title, month, cover, description;
  final int year, articleCount;
  final bool isPublished;

  Magazine.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        title = j['title'] ?? '',
        month = j['month'] ?? '',
        year = (j['year'] ?? 0) is int ? j['year'] : int.tryParse('${j['year']}') ?? 0,
        cover = j['cover'] ?? '',
        description = j['description'] ?? '',
        articleCount = j['articleCount'] ?? 0,     // <- count badge, no article fetch
        isPublished = j['isPublished'] ?? false;
}

// Light list item — only what a list row shows, incl. a cacheable thumbnail URL.
class ArticleListItem {
  final String id, magazineId, title, category, author, date;
  final bool hasHero;
  final String? thumbUrl; // e.g. "/api/articles/May20265/hero" (relative)
  ArticleListItem.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        magazineId = j['magazineId'] ?? '',
        title = j['title'] ?? '',
        category = j['category'] ?? '',
        author = j['author'] ?? '',
        date = j['date'] ?? '',
        hasHero = j['hasHero'] ?? false,
        thumbUrl = j['thumbUrl'];

  // Full URL for the list thumbnail (small, cached image endpoint).
  String? fullThumb(String baseUrl) => thumbUrl == null ? null : baseUrl + thumbUrl!;
}

// In the article list row:
//   if (a.thumbUrl != null) Image.network(a.fullThumb(ApiService.baseUrl)!)
// Each thumbnail is a separate cacheable request — the list JSON stays tiny.

// Full article — for the reader screen
class Article {
  final String id, title, hero, author, date;
  final List<String> paragraphs;

  Article.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        title = j['title'] ?? '',
        hero = j['hero'] ?? '',
        author = j['author'] ?? '',
        date = j['date'] ?? '',
        paragraphs = (j['paragraphs'] as List?)?.cast<String>() ?? [];
}
```

---

## Usage in a screen

```dart
// Magazine grid
final magazines = await ApiService.getMagazines();
// each tile: magazine.title + "${magazine.articleCount} articles"

// On tapping a magazine -> fast light list
final articles = await ApiService.getArticleList(magazine.id);

// On tapping an article -> full content
final article = await ApiService.getArticle(articleItem.id);
```

**Key point:** the magazine screen and the article-list screen never load images — only `getArticle(id)` does, for the single article opened. That's what keeps it fast.

---

## Full API reference

See [API.md](API.md) for all endpoints, including the emirates-aware news/events/slider filtering.
