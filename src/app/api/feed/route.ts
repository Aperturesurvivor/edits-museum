import { getFeedPage } from "@/lib/data";
import { WINGS } from "@/lib/wings";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const valid = new Set(WINGS.map((w) => w.slug));
  const wings = (u.searchParams.get("wings") ?? "").split(",").filter((w) => valid.has(w));
  const num = (k: string) => Math.max(0, Math.min(100000, Number(u.searchParams.get(k)) || 0));
  const page = await getFeedPage(wings, num("mo"), num("ro"), 12);
  return Response.json(page, { headers: { "Cache-Control": "public, max-age=60" } });
}
