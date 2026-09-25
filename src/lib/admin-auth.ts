// Admin session token.
// The cookie value is an HMAC of a fixed label keyed with ADMIN_PASSWORD, so it
// can only be produced by someone who knows the password. (Previously the
// cookie was the literal "1", which anyone could set by hand.)
// Uses Web Crypto so it works in both the Edge middleware and Node routes.

export const ADMIN_COOKIE = "dt_admin";

export async function adminToken(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("drytrip-admin-v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const expected = await adminToken();
  if (!expected || value.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < value.length; i++) diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
