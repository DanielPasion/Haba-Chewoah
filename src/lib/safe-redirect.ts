/**
 * Constrains a user-supplied redirect target to relative paths only,
 * preventing open-redirect phishing via `?callbackUrl=https://evil.com`.
 * Treats `//host/path` (protocol-relative) as off-site and rejects it.
 */
export function safeCallbackUrl(
  raw: string | undefined | null,
  fallback = "/",
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  return raw;
}
