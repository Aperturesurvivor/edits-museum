import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseXLink } from "@/lib/submissions";
import { EDITS, WINGS } from "@/lib/data";

// v1 stub storage: an append-only JSONL file outside git (data/runtime/ is gitignored).
// On Vercel the filesystem is read-only; swap for a real DB (Supabase/Postgres) before deploy.
const DIR = path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "submissions.jsonl");

async function readQueue(): Promise<{ id: string }[]> {
  try {
    const txt = await readFile(FILE, "utf8");
    return txt.split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export async function GET() {
  const q = await readQueue();
  return Response.json({ pending: q.length });
}

export async function POST(req: Request) {
  let body: { url?: unknown; wing?: unknown };
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = typeof body.url === "string" ? parseXLink(body.url) : null;
  if (!parsed) return Response.json({ error: "Paste a link to a post on X, like https://x.com/user/status/123…" }, { status: 400 });
  const wing = typeof body.wing === "string" && WINGS.some((w) => w.slug === body.wing) ? body.wing : null;

  if (EDITS.some((e) => e.id === parsed.id)) return Response.json({ status: "exists", id: parsed.id });
  const q = await readQueue();
  if (q.some((s) => s.id === parsed.id)) return Response.json({ status: "already_pending", id: parsed.id });

  await mkdir(DIR, { recursive: true });
  await appendFile(FILE, JSON.stringify({ ...parsed, wing, status: "pending", submittedAt: new Date().toISOString() }) + "\n");
  return Response.json({ status: "pending", id: parsed.id }, { status: 201 });
}
