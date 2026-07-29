# Flutter — Wings API Guide

Wings: a category (name + image) containing items (caption + description +
multiple images). Shown on the home screen below Other Magazines. Base URL:
`https://smartflix.cloud`.

---

## The flow

| Step | Endpoint | Notes |
|---|---|---|
| 1. Categories | `GET /api/wings-categories` | Light — includes `itemCount`, no item data |
| 2. Items in a category | `GET /api/wings?categoryId={id}` | Each item includes its full `images` array |
| 3. Single item (optional) | `GET /api/wings/{id}` | Same shape as one entry from step 2 |

No `list=1`/light-mode split needed here — categories and items are already
small (images are URLs, not embedded base64).

---

## 1. List categories

```
GET /api/wings-categories
```
```json
[{ "id": "wc_youth", "name": "Youth Wing", "image": "/uploads/wings/wing_xxx.jpg", "sortOrder": 1, "itemCount": 5 }]
```

```dart
class WingsCategory {
  final String id, name, image;
  final int itemCount;
  WingsCategory.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        name = j['name'] ?? '',
        image = j['image'] ?? '',
        itemCount = j['itemCount'] ?? 0;

  // image is a relative path (e.g. "/uploads/wings/xxx.jpg") — prepend the base URL.
  String get imageUrl => image.startsWith('http') ? image : '${Api.base}$image';
}

Future<List<WingsCategory>> getWingsCategories() async {
  final res = await http.get(Uri.parse('${Api.base}/api/wings-categories'));
  return (jsonDecode(res.body) as List).map((e) => WingsCategory.fromJson(e)).toList();
}
```

## 2. List items in a category

```
GET /api/wings?categoryId={id}
```
```json
[{
  "id": "w_youth_1", "categoryId": "wc_youth",
  "caption": "Annual Youth Conference 2026",
  "description": "Delegates from across the region gathered...",
  "sortOrder": 1,
  "images": ["/uploads/wings/wing_xxx_1.jpg", "/uploads/wings/wing_xxx_2.jpg"]
}]
```

```dart
class WingItem {
  final String id, categoryId, caption, description;
  final List<String> images; // relative paths, e.g. "/uploads/wings/xxx.jpg"
  WingItem.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        categoryId = j['categoryId'] ?? '',
        caption = j['caption'] ?? '',
        description = j['description'] ?? '',
        images = (j['images'] as List?)?.cast<String>() ?? [];

  String _full(String path) => path.startsWith('http') ? path : '${Api.base}$path';

  // Full URLs, ready for Image.network / CachedNetworkImage.
  List<String> get imageUrls => images.map(_full).toList();
  String? get thumb => images.isNotEmpty ? _full(images.first) : null;
}

Future<List<WingItem>> getWingItems(String categoryId) async {
  final res = await http.get(Uri.parse('${Api.base}/api/wings?categoryId=$categoryId'));
  return (jsonDecode(res.body) as List).map((e) => WingItem.fromJson(e)).toList();
}
```

## 3. Single item detail (optional — step 2's list already has everything)

```
GET /api/wings/{id}
```
Same JSON shape as one item from step 2. Use this only if you navigate to an
item by id without already having it in memory (e.g. from a deep link).

```dart
Future<WingItem> getWingItem(String id) async {
  final res = await http.get(Uri.parse('${Api.base}/api/wings/$id'));
  return WingItem.fromJson(jsonDecode(res.body));
}
```

---

## Screen usage

```dart
// Home row / "View All" grid
final categories = await getWingsCategories();
// each tile: CachedNetworkImage(imageUrl: category.imageUrl) + category.name + "${category.itemCount} items"

// Category tapped -> item grid
final items = await getWingItems(category.id);
// each tile: CachedNetworkImage(imageUrl: item.thumb) + item.caption

// Item tapped -> detail screen
// show: item.imageUrls[0] as hero, item.caption as title, item.description as body,
// then a grid/gallery of ALL item.imageUrls (tap to view fullscreen)
if (item.images.length > 1) {
  // build a simple gallery: GridView of item.imageUrls, or a PageView for swiping
}
```

**Note on image URLs:** `image`/`images` are **relative paths** (e.g.
`/uploads/wings/xxx.jpg`) since they're real uploaded files, not base64 —
same pattern as the `thumbUrl` used for article thumbnails in
[FLUTTER_API_CHANGES.md](FLUTTER_API_CHANGES.md). Use the `imageUrl`/`imageUrls`
getters above rather than the raw fields.
