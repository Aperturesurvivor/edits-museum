import type { Edit, EditStatus, PublicEdit } from "./types";
import { wingBySlug } from "./wings";

const STATUS_ADJ: Record<EditStatus, number> = {
  approved: 0.2,
  approved_by_josiah: 0.3,
  hand_kept: 0.2,
  unscreened: 0,
  flagged_review: -0.3,
  flagged_medium: -0.6,
};

/** Freedom of speech, not freedom of reach: engagement + civilization lean + screening state. */
export function score(e: Pick<Edit, "likes" | "bookmarks" | "views" | "wing" | "status" | "weights">): number {
  const engagement = Math.log10(e.likes + 2 * e.bookmarks + 1) + 0.3 * Math.log10(e.views + 1);
  return engagement + wingBoost(e) + STATUS_ADJ[e.status];
}

/** Each wing's boost is multiplied by the edit's weight for that wing; the best one counts. */
export function wingBoost(e: Pick<Edit, "wing" | "weights">): number {
  if (!e.weights || !Object.keys(e.weights).length) return wingBySlug(e.wing)?.civBoost ?? 0;
  let best = 0;
  for (const [k, w] of Object.entries(e.weights)) best = Math.max(best, (wingBySlug(k)?.civBoost ?? 0) * w);
  return best;
}

/** Cap how many slots one creator can take in a ranked list. */
export function capPerAuthor<T extends { author: string }>(items: T[], n: number, perAuthor: number): T[] {
  const counts: Record<string, number> = {};
  const out: T[] = [];
  for (const e of items) {
    const c = counts[e.author] ?? 0;
    if (c >= perAuthor) continue;
    counts[e.author] = c + 1;
    out.push(e);
    if (out.length >= n) break;
  }
  return out;
}

export function toPublic(e: Edit): PublicEdit {
  const { caption, subject, genre, source, weights, ...rest } = e;
  void caption; void subject; void genre; void source; void weights;
  return rest;
}
