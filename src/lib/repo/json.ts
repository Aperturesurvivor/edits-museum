import "server-only";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import raw from "../../../data/edits.json";
import { score } from "../ranking";
import type { Edit, Submission } from "../types";
import type { EditRepository, ListQuery, SubmissionRepository } from "./types";

const ALL: Edit[] = (raw as Edit[])
  .filter((e) => e.thumb || e.video)
  .map((e) => ({ e, s: score(e) }))
  .sort((a, b) => b.s - a.s)
  .map((x) => x.e);
const BY_ID = new Map(ALL.map((e) => [e.id, e]));

export const jsonEdits: EditRepository = {
  async listRanked({ wings, notWings, offset = 0, limit }: ListQuery) {
    let list = ALL;
    if (wings?.length) list = list.filter((e) => wings.includes(e.wing));
    if (notWings?.length) list = list.filter((e) => !notWings.includes(e.wing));
    return list.slice(offset, offset + limit);
  },
  async getEdit(id) {
    return BY_ID.get(id) ?? null;
  },
  async wingCounts() {
    const c: Record<string, number> = {};
    for (const e of ALL) c[e.wing] = (c[e.wing] ?? 0) + 1;
    return c;
  },
  async hasEdit(id) {
    return BY_ID.has(id);
  },
};

// v1 submissions: append-only JSONL outside git (data/runtime/ is gitignored).
// Vercel's filesystem is read-only, so production uses the Supabase backend.
const DIR = path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "submissions.jsonl");

async function readQueue(): Promise<Submission[]> {
  try {
    return (await readFile(FILE, "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export const jsonSubmissions: SubmissionRepository = {
  async has(id) {
    return (await readQueue()).some((s) => s.id === id);
  },
  async add(s) {
    await mkdir(DIR, { recursive: true });
    await appendFile(FILE, JSON.stringify(s) + "\n");
  },
  async countPending() {
    return (await readQueue()).length;
  },
};
