# Flutter — Device Token Registration (per-user push)

The dashboard can now send push notifications to a **specific set of users**
(e.g. "everyone whose subscription is expired") — not just a topic broadcast.
This requires the app to register each device's FCM token against the
logged-in user's id. Without this step, expired/expiring reminders have no
recipients (topic-based notifications — magazine publish, news, events,
manual "All users"/emirate sends — are unaffected and need no change).

Base URL: `https://smartflix.cloud`

---

## 1. Register the token after login

Call this once after a successful login (and again whenever FCM issues a new
token via `onTokenRefresh` — tokens can rotate).

```
POST /api/device-tokens
Body: { userId, token, platform }   // platform: "android" | "ios"
```

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> registerDeviceToken(String userId) async {
  final fm = FirebaseMessaging.instance;
  final token = await fm.getToken();
  if (token == null) return;

  await http.post(
    Uri.parse('${Api.base}/api/device-tokens'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'userId': userId,
      'token': token,
      'platform': Platform.isIOS ? 'ios' : 'android',
    }),
  );

  // Keep it fresh — call the same registration whenever the token rotates.
  fm.onTokenRefresh.listen((newToken) {
    http.post(
      Uri.parse('${Api.base}/api/device-tokens'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': userId, 'token': newToken, 'platform': Platform.isIOS ? 'ios' : 'android'}),
    );
  });
}
```

Call `registerDeviceToken(user.id)` right after `setupPush(...)` from
[FIREBASE_PUSH_SETUP.md](FIREBASE_PUSH_SETUP.md), once you have the logged-in
user's id.

---

## 2. (Optional) Remove the token on logout

So a signed-out device stops receiving personal reminders meant for that user:

```
DELETE /api/device-tokens
Body: { token }
```

```dart
Future<void> unregisterDeviceToken() async {
  final token = await FirebaseMessaging.instance.getToken();
  if (token == null) return;
  await http.delete(
    Uri.parse('${Api.base}/api/device-tokens'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'token': token}),
  );
}
```

---

## What this enables

Once devices are registered, the dashboard **Users** page gets two buttons —
**Notify Expiring** and **Notify Expired** — that send a personalized push
(placeholders `{name}` and `{expiry}` filled in per user) only to matched
users' registered devices. Everything is logged in **Notification Master**
(`/dashboard/notifications`) regardless of send method (topic broadcast or
per-user tokens).
