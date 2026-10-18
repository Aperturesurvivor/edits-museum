/** Accepts X/Twitter status links only in v1. Returns the canonical URL and post id. */
export function parseXLink(input: string): { id: string; author: string; url: string } | null {
  const m = input.trim().match(/^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{5,25})(?:[/?#].*)?$/);
  if (!m) return null;
  return { author: m[1], id: m[2], url: `https://x.com/${m[1]}/status/${m[2]}` };
}
