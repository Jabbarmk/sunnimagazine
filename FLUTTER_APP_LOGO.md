# Flutter — App Logo API

The app logo is now configurable from the dashboard (`/dashboard/settings` →
**App Logo**) instead of being a fixed image bundled into the app. Use this
endpoint to fetch and display it dynamically. Base URL: `https://smartflix.cloud`
(or `https://api.gulf-sathyadhara.com`).

---

## Get the current logo

```
GET /api/app-settings
```
```json
{ "logo": "/uploads/logo/logo_1785419398236.png" }
```
`logo` is a **relative path** (a real uploaded file, like article thumbnails
and Wings images) — empty string `""` if no logo has been uploaded yet.

```dart
class AppSettings {
  final String logo;
  AppSettings.fromJson(Map<String, dynamic> j) : logo = j['logo'] ?? '';

  String? get logoUrl => logo.isEmpty ? null : '${Api.base}$logo';
}

Future<AppSettings> getAppSettings() async {
  final res = await http.get(Uri.parse('${Api.base}/api/app-settings'));
  return AppSettings.fromJson(jsonDecode(res.body));
}
```

## Usage

```dart
final settings = await getAppSettings();

// Splash screen / app bar / login screen:
if (settings.logoUrl != null) {
  CachedNetworkImage(imageUrl: settings.logoUrl!)
} else {
  Image.asset('assets/logo.png') // fallback to your bundled default
}
```

**Recommendation:** fetch this once at app startup (e.g. alongside your
splash-screen data loading) and cache it locally (`SharedPreferences` or an
in-memory singleton) so the logo doesn't need a network round-trip on every
screen that shows it. Re-fetch periodically (e.g. once per app launch) so
admin-side logo changes propagate without needing an app update.

---

## Notes
- This is a **read-only** endpoint for the app — the logo is only changed via
  the dashboard (admin uploads a new image, which replaces the old one).
- Max upload size is 5 MB; any image type is accepted.
- No auth required to read it — same as other public content endpoints
  (magazines, articles, news).
