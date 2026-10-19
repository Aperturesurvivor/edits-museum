import "server-only";
import { cacheLife } from "next/cache";
import { edits } from "./repo";
import { capPerAuthor, toPublic } from "./ranking";
import type { PublicEdit } from "./types";

export async function getHallOfFame(n = 12): Promise<PublicEdit[]> {
  "use cache";
  cacheLife("minutes");
  return capPerAuthor(await edits.listRanked({ limit: 200 }), n, 1).map(toPublic);
}

export async function getWingEdits(wing: string, limit: number, perAuthor = 3): Promise<PublicEdit[]> {
  "use cache";
  cacheLife("minutes");
  const ranked = await edits.listRanked({ wings: [wing], limit: Math.max(limit * 4, 40) });
  return capPerAuthor(ranked, limit, perAuthor).map(toPublic);
}

export async function getWingPage(wing: string, offset: number, limit: number): Promise<PublicEdit[]> {
  "use cache";
  cacheLife("minutes");
  return (await edits.listRanked({ wings: [wing], offset, limit })).map(toPublic);
}

export async function getLiveCount(): Promise<number> {
  "use cache";
  cacheLife("minutes");
  return edits.liveCount();
}

export async function getWingCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife("minutes");
  return edits.wingCounts();
}

/**
 * Feed page: picked wings get 3 of every 4 slots, the rest is discovery. Two cursors keep it stable.
 */
export async function getFeedPage(picked: string[], mo: number, ro: number, size = 12) {
  if (!picked.length) {
    const items = (await edits.listRanked({ offset: ro, limit: size })).map(toPublic);
    return { items, mo, ro: ro + items.length, done: items.length < size };
  }
  const mineWant = Math.ceil((size * 3) / 4);
  const mine = await edits.listRanked({ wings: picked, offset: mo, limit: mineWant });
  const rest = await edits.listRanked({ notWings: picked, offset: ro, limit: size - mine.length });
  const items = [];
  let r = 0;
  for (let i = 0; i < mine.length; i++) {
    items.push(mine[i]);
    if (i % 3 === 2 && r < rest.length) items.push(rest[r++]);
  }
  while (r < rest.length) items.push(rest[r++]);
  return { items: items.map(toPublic), mo: mo + mine.length, ro: ro + r, done: items.length === 0 };
}
