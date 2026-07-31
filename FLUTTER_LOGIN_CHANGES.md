# Flutter — Login / Subscription Changes

Subscriptions now store a real day (`DD/MM/YYYY` in the dashboard), not just a
month, and the login response now tells you directly whether a user's
subscription has expired instead of leaving it to the client to work out.
Base URL: `https://api.gulf-sathyadhara.com`.

**Backward compatible:** existing accounts created before this change may
still have `subscriptionFrom`/`subscriptionTo` in the old `YYYY-MM` format —
your app doesn't need to special-case this, see §1.

---

## 1. Date format

`subscriptionFrom` / `subscriptionTo` are ISO date strings:

- New/edited subscriptions → `"YYYY-MM-DD"`, e.g. `"2026-12-31"`.
- Older, not-yet-touched subscriptions → may still be `"YYYY-MM"`, e.g. `"2026-12"`.

Dart's `DateTime.parse` handles both natively (`"2026-12"` parses as the 1st
of that month), so no special-casing is needed — just parse and format for
display:

```dart
String formatSubscriptionDate(String raw) {
  if (raw.isEmpty) return '';
  final d = DateTime.tryParse(raw);
  if (d == null) return raw;
  return '${d.day.toString().padLeft(2, '0')}/'
         '${d.month.toString().padLeft(2, '0')}/'
         '${d.year}';
}
```

---

## 2. `isExpired` — new field on login

```
POST /api/app-login
Body: { identifier, password }
```

Response now includes `isExpired`:

```json
{
  "id": 123,
  "name": "...",
  "email": "...",
  "mobile": "...",
  "location": "...",
  "photo": "",
  "emirates": "",
  "subscriptionFrom": "2026-01-15",
  "subscriptionTo": "2026-12-31",
  "isExpired": false,
  "referredBy": "",
  "referralMobile": ""
}
```

`isExpired` is computed server-side from `subscriptionTo` (`true` once that
date is in the past) — you no longer need to compare dates client-side to
know whether to show an "expired" state.

```dart
class AppUser {
  final String id, name, email, mobile;
  final String subscriptionFrom, subscriptionTo;
  final bool isExpired;

  AppUser.fromJson(Map<String, dynamic> j)
      : id = j['id'] ?? '',
        name = j['name'] ?? '',
        email = j['email'] ?? '',
        mobile = j['mobile'] ?? '',
        subscriptionFrom = j['subscriptionFrom'] ?? '',
        subscriptionTo = j['subscriptionTo'] ?? '',
        isExpired = j['isExpired'] ?? false;
}
```

Use it directly on the Profile screen instead of any existing client-side
expiry calculation:

```dart
if (user.isExpired) {
  // show "Subscription expired" banner / renew CTA
} else {
  // show subscriptionTo, e.g. "Active until ${formatSubscriptionDate(user.subscriptionTo)}"
}
```

> Note: `isExpired` is only returned at login time, not pushed live — if a
> subscription expires while the user stays logged in without re-fetching,
> your stored `isExpired` will go stale until next login. If you need it
> live, re-check on app resume or add a lightweight status endpoint later.

---

## Summary of endpoints touched

| Endpoint | Change |
|---|---|
| `POST /api/app-login` | `subscriptionFrom`/`subscriptionTo` now day-precise (`YYYY-MM-DD`); response includes new `isExpired: boolean` |
