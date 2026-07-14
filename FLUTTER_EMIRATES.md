# Flutter — Emirates Field Guide

The app now has an **emirates** field: every user picks their emirate (or
**Global**) at signup, and content (news, events, home slider) can be tagged
to a specific emirate or `Global` (shown to everyone). This guide covers what
changes in the Flutter app. Base URL: `https://smartflix.cloud`.

**Backward compatible:** the API does **not** require `emirates` at signup —
your current app build keeps working unread. Add the picker when you're ready;
until then, those users just default to seeing Global-only content.

---

## 1. The emirate values

```dart
const kEmirates = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
  'Global',   // sees everything; content tagged Global is shown to everyone
];
```

**Visibility rule** (mirrors the server, useful if you ever filter client-side):
- User = `Global` → sees everything.
- Content = `Global` (or untagged) → shown to everyone.
- User = a specific emirate → sees that emirate's content **+** `Global` content.
- User = empty/not set → sees **only** `Global` content.

---

## 2. Signup — add an emirate picker

```
POST /api/app-signup
Body: { name, email, mobile, emirates }   // emirates is optional but recommended
```

```dart
Future<void> signup(String name, String email, String mobile, String emirate) async {
  final res = await http.post(
    Uri.parse('${Api.base}/api/app-signup'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': name,
      'email': email,
      'mobile': mobile,
      'emirates': emirate,   // one of kEmirates
    }),
  );
  if (res.statusCode != 200) {
    final err = jsonDecode(res.body)['error'] ?? 'Signup failed';
    throw Exception(err);
  }
}
```
Add a **dropdown/picker** for `kEmirates` on the signup screen, required in your UI
(the server accepts it missing, but you want every new user tagged).

---

## 3. Login — store the returned emirate

```
POST /api/app-login  →  { id, name, email, mobile, ..., emirates, ... }
```

```dart
class AppUser {
  final String id, name, email, mobile, emirates;
  AppUser.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        name = j['name'] ?? '',
        email = j['email'] ?? '',
        mobile = j['mobile'] ?? '',
        emirates = j['emirates'] ?? '';
}

// After a successful login, persist `user.emirates` (e.g. SharedPreferences)
// alongside the rest of the session — you'll need it for every filtered request.
```

---

## 4. Filtering content by emirate

### Home slider — filtered **server-side**
```
GET /api/slides?userId={id}
```
Pass the logged-in user's id; the server looks up their emirate and returns
only slides matching it (+ Global). Omit `userId` and you get everything
unfiltered (that's what the dashboard uses).

```dart
Future<List<Slide>> getSlides(String? userId) async {
  final url = userId != null
      ? '${Api.base}/api/slides?userId=$userId'
      : '${Api.base}/api/slides';
  final res = await http.get(Uri.parse(url));
  return (jsonDecode(res.body) as List).map((e) => Slide.fromJson(e)).toList();
}
```

### News & Events — filtered **client-side**
These endpoints return **everything**, each item tagged with `emirates`
(`"Global"` by default). Filter using the visibility rule above:

```
GET /api/news    → [{ ..., emirates }]
GET /api/events  → [{ ..., emirates }]
```

```dart
bool emirateVisible(String? userEmirate, String? itemEmirate) {
  final ue = (userEmirate ?? '').trim();
  final ie = (itemEmirate ?? '').trim().isEmpty ? 'Global' : itemEmirate!.trim();
  if (ue == 'Global') return true;
  if (ie == 'Global') return true;
  if (ue.isEmpty) return false;
  return ie == ue;
}

final visibleNews = allNews.where((n) => emirateVisible(user.emirates, n.emirates)).toList();
final visibleEvents = allEvents.where((e) => emirateVisible(user.emirates, e.emirates)).toList();
```

> Magazines and articles are **not** emirate-filtered — every user sees all of them.

---

## 5. Login is now required in the web app (not yet enforced server-side)

We removed the "skip login" option from the **web** app so every viewer has a
known emirate. If your Flutter app has a similar "Continue as guest" button,
consider removing it too — otherwise those users never get an emirate and
only ever see `Global` content. This is a UX decision, not an API requirement;
the API still works fine without a logged-in user (slider without `userId`,
news/events unfiltered).

---

## Summary of endpoints touched

| Endpoint | Change |
|---|---|
| `POST /api/app-signup` | Accepts optional `emirates` |
| `POST /api/app-login` | Response includes `emirates` |
| `GET /api/slides?userId=` | New param — server-side emirate filter |
| `GET /api/news` / `GET /api/events` | Each item now has `emirates` — filter client-side |
