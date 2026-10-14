/**
 * Sanitizes returnTo to only accept internal paths (AC-25).
 * Only values starting with a single '/' followed by a non-slash, non-backslash character are accepted.
 */
export function sanitizeReturnTo(
  url: string | null | undefined,
  fallback: string = "/",
): string {
  if (!url) return fallback;
  if (url === "/") return "/";
  if (/^\/[^/\\]/.test(url)) {
    return url;
  }
  return fallback;
}
