# Firebase Push Notifications — Setup Guide

The backend + dashboard are built. Pushes send to **FCM topics** (`all`, `emirate_<X>`),
so there's **no device-token database**. To go live you need to (1) create a Firebase
project, (2) give the server the service-account key, (3) wire FCM into the Flutter app.

---

## 1. Firebase project + service account (you do this once)

1. Go to <https://console.firebase.google.com> → create/select your project.
2. **Project Settings → Cloud Messaging** — make sure the *Firebase Cloud Messaging API (V1)* is enabled.
3. **Project Settings → Service accounts → Generate new private key** → downloads a JSON file. Keep it secret.

### Put the key on the server
Add it to the server's `.env.local` as a **single line** (the whole JSON):

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...", ...}
```

Then restart the app (`pm2 restart sunnimagazine`).
Until this is set, sends are a safe no-op (publishing still works; the dashboard shows "not configured").

> Tip: keep the `\n` inside `private_key` exactly as in the JSON — the code un-escapes them.

---

## 2. What the backend already does

- **Dashboard → Notifications** — compose a title + message, pick **All users** or an emirate, Send.
- **Auto-send:** publishing a magazine → topic `all`; adding **news**/**events** → the item's emirate topic (Global → `all`). Only fires on *new* items / the publish transition, not on edits.
- Endpoint: `POST /api/notifications/send` `{ title, body, target }` (`target` = `"all"` or an emirate name).

---

## 3. Flutter app (the app must subscribe to topics)

Add the package and config, then subscribe each user to `all` + their emirate topic.

### pubspec.yaml
```yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
```

### Android / iOS
- Android: put `google-services.json` in `android/app/`, add the Google services Gradle plugin.
- iOS: put `GoogleService-Info.plist` in `ios/Runner/`, enable Push Notifications + Background Modes.
- (Both files come from the same Firebase project, *Add app* flow.)

### main.dart — init + subscribe
```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> setupPush(String? userEmirate) async {
  await Firebase.initializeApp();
  final fm = FirebaseMessaging.instance;

  // Ask permission (iOS / Android 13+)
  await fm.requestPermission();

  // Everyone gets broadcast + magazine notifications
  await fm.subscribeToTopic('all');

  // Emirate-targeted news/events. "Global" users just stay on 'all'.
  if (userEmirate != null && userEmirate.isNotEmpty && userEmirate != 'Global') {
    final topic = 'emirate_' + userEmirate.replaceAll(RegExp(r'[^a-zA-Z0-9]+'), '_');
    await fm.subscribeToTopic(topic);
  }

  // Foreground messages
  FirebaseMessaging.onMessage.listen((msg) {
    // show a local notification / snackbar with msg.notification?.title / .body
  });
}
```

Call `setupPush(user.emirates)` after login (you get `emirates` from the login response).
On logout, `unsubscribeFromTopic(...)` the emirate topic if you want.

The topic name MUST match the server: `emirate_` + emirate with non-alphanumerics → `_`
(e.g. `Abu Dhabi` → `emirate_Abu_Dhabi`, `Ras Al Khaimah` → `emirate_Ras_Al_Khaimah`).

---

## 4. Test
1. Set `FIREBASE_SERVICE_ACCOUNT` on the server, restart.
2. Dashboard → Notifications → send a test to **All users**.
3. A device with the app (subscribed to `all`) should receive it.
4. Then publish a magazine / add a news item to test auto-send.
