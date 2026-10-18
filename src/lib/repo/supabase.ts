import "server-only";
import type { Edit, Submission } from "../types";
import type { EditRepository, ListQuery, SubmissionRepository } from "./types";

/**
 * Supabase backend over PostgREST (plain fetch, no SDK). Schema: supabase/schema.sql.
 * Env (server-only, never NEXT_PUBLIC_):
 *   SUPABASE_URL               https://<project>.supabase.co
 *   SUPABASE_ANON_KEY          reads (RLS allows select on public.edits)
 *   SUPABASE_SERVICE_ROLE_KEY  writes (submissions insert); never sent to the browser
 */
const URL_ = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Row = {
  id: string; url: string; author: string; author_name: string; caption: string; created_at: string | null;
  likes: number; bookmarks: number; views: number; video_views: number; duration_s: number | null;
  media_type: string | null; thumb: string | null; width: number | null; height: number | null;
  video_hi: string | null; video_lo: string | null; genre: string | null; wing: string; subject: string;
  status: Edit["status"]; source: string;
};

const fromRow = (r: Row): Edit => ({
  id: r.id, url: r.url, author: r.author, authorName: r.author_name, caption: r.caption, createdAt: r.created_at,
  likes: r.likes, bookmarks: r.bookmarks, views: r.views, videoViews: r.video_views, durationS: r.duration_s,
  mediaType: r.media_type, thumb: r.thumb, width: r.width, height: r.height,
  video: r.video_hi ? { hi: r.video_hi, lo: r.video_lo } : null,
  genre: r.genre, wing: r.wing, subject: r.subject, status: r.status, source: r.source,
});

async function rest<T>(pathAndQuery: string, init: RequestInit = {}, write = false): Promise<T> {
  if (!URL_ || !ANON) throw new Error("Supabase backend selected but SUPABASE_URL / SUPABASE_ANON_KEY are not set");
  const key = write ? SERVICE : ANON;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for writes");
  const res = await fetch(`${URL_}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${pathAndQuery.split("?")[0]}`);
  return (res.status === 204 ? null : await res.json()) as T;
}

const inList = (xs: string[]) => `(${xs.map((x) => `"${x.replace(/"/g, "")}"`).join(",")})`;

export const supabaseEdits: EditRepository = {
  async listRanked({ wings, notWings, offset = 0, limit }: ListQuery) {
    const p = new URLSearchParams({ select: "*", order: "score.desc", offset: String(offset), limit: String(limit) });
    if (wings?.length) p.append("wing", `in.${inList(wings)}`);
    if (notWings?.length) p.append("wing", `not.in.${inList(notWings)}`);
    return (await rest<Row[]>(`edits?${p}`)).map(fromRow);
  },
  async getEdit(id) {
    const rows = await rest<Row[]>(`edits?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
    return rows[0] ? fromRow(rows[0]) : null;
  },
  async wingCounts() {
    const rows = await rest<{ wing: string; n: number }[]>(`wing_counts?select=wing,n`);
    return Object.fromEntries(rows.map((r) => [r.wing, r.n]));
  },
  async hasEdit(id) {
    return (await rest<{ id: string }[]>(`edits?select=id&id=eq.${encodeURIComponent(id)}&limit=1`)).length > 0;
  },
};

export const supabaseSubmissions: SubmissionRepository = {
  async has(id) {
    return (await rest<{ id: string }[]>(`submissions?select=id&id=eq.${encodeURIComponent(id)}&limit=1`, {}, true)).length > 0;
  },
  async add(s: Submission) {
    await rest(`submissions`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ id: s.id, author: s.author, url: s.url, wing: s.wing, status: s.status, submitted_at: s.submittedAt }),
    }, true);
  },
  async countPending() {
    const rows = await rest<{ count: number }[]>(`submissions?select=count&status=eq.pending`, {}, true);
    return rows[0]?.count ?? 0;
  },
};
