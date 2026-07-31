# Flutter — Change Password

A new endpoint lets a logged-in user change their own password from the
Profile screen. Base URL: `https://api.gulf-sathyadhara.com`.

**Security note:** app-user passwords were previously stored in plaintext.
This change also upgrades password storage to bcrypt hashes — existing
passwords self-heal to a hash automatically the next time that user logs in
or changes their password. No action needed on your end for this part; it's
transparent to the client either way (you still just send the plain password
over HTTPS, comparison happens server-side).

---

## 1. Endpoint

```
POST /api/app-change-password
Body: { id, currentPassword, newPassword }
```

- `id` — the logged-in user's id (from the stored login response).
- `currentPassword` — required, verified against the stored password.
- `newPassword` — required, minimum 6 characters.

**Success (200):**
```json
{ "ok": true }
```

**Errors:**
| Status | Body | Meaning |
|---|---|---|
| 400 | `{ "error": "Required" }` | Missing `id`, `currentPassword`, or `newPassword` |
| 400 | `{ "error": "New password must be at least 6 characters" }` | `newPassword` too short |
| 401 | `{ "error": "Current password is incorrect" }` | `currentPassword` doesn't match |
| 404 | `{ "error": "User not found" }` | `id` doesn't match any account |

---

## 2. Dart implementation

```dart
Future<void> changePassword(String userId, String currentPassword, String newPassword) async {
  final res = await http.post(
    Uri.parse('${Api.base}/api/app-change-password'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'id': userId,
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    }),
  );
  if (res.statusCode != 200) {
    final err = jsonDecode(res.body)['error'] ?? 'Failed to change password';
    throw Exception(err);
  }
}
```

---

## 3. Profile screen UI

Add a "Change Password" option (e.g. a list tile or button) on the Profile
screen, opening a small form with three fields:

- Current password
- New password
- Confirm new password (client-side check only — `newPassword` must match
  before calling the API; the server doesn't take a confirmation field)

```dart
Future<void> onChangePasswordPressed() async {
  if (newPasswordController.text != confirmController.text) {
    showError('Passwords do not match');
    return;
  }
  try {
    await changePassword(user.id, currentPasswordController.text, newPasswordController.text);
    showSuccess('Password changed successfully');
  } catch (e) {
    showError(e.toString());
  }
}
```

No re-login is required after a successful change — the user's session
(however you're storing it, e.g. SharedPreferences) stays valid; only the
stored password changes.

---

## Summary of endpoints touched

| Endpoint | Change |
|---|---|
| `POST /api/app-change-password` | New — change the logged-in user's password |
| `POST /api/app-login` | Now accepts bcrypt-hashed **or** legacy plaintext passwords (self-healing); no request/response shape change |
