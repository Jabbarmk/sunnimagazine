// Server-side password helpers shared by the approve and send-details APIs.
import crypto from "crypto";

export function isBcryptHash(v: string): boolean {
  return v.startsWith("$2a$") || v.startsWith("$2b$") || v.startsWith("$2y$");
}

// No ambiguous characters (0/O, 1/l/I) — generated passwords get read out of
// an email or over WhatsApp, so every character must be unmistakable.
const PASSWORD_CHARSET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generatePassword(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARSET[crypto.randomInt(PASSWORD_CHARSET.length)];
  }
  return out;
}
