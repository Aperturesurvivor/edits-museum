import { parseXLink } from "@/lib/submissions";
import { edits, submissions } from "@/lib/repo";
import { WINGS } from "@/lib/wings";

export async function GET() {
  return Response.json({ pending: await submissions.countPending() });
}

export async function POST(req: Request) {
  let body: { url?: unknown; wing?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = typeof body.url === "string" ? parseXLink(body.url) : null;
  if (!parsed) return Response.json({ error: "Paste a link to a post on X, like https://x.com/user/status/123…" }, { status: 400 });
  const wing = typeof body.wing === "string" && WINGS.some((w) => w.slug === body.wing) ? body.wing : null;

  if (await edits.hasEdit(parsed.id)) return Response.json({ status: "exists", id: parsed.id });
  if (await submissions.has(parsed.id)) return Response.json({ status: "already_pending", id: parsed.id });
  await submissions.add({ ...parsed, wing, status: "pending", submittedAt: new Date().toISOString() });
  return Response.json({ status: "pending", id: parsed.id }, { status: 201 });
}
