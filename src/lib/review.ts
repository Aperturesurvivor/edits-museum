import type { Edit } from "./types";

/**
 * Visual review verdict (notebooks/review.ipynb -> scripts/ingest-verdicts.py -> data/review.json).
 * Judged from frames of the actual video + transcript, never from post text keywords.
 */
export type Verdict =
  | "pass" | "queue" | "dead"
  | "reject_nsfw" | "reject_not_edit" | "reject_unfit" | "reject_illegal";

export type Review = {
  verdict: Verdict;
  /** Primary wing = max weight. */
  wing: string | null;
  /** 0-1 relevance per wing. */
  weights: Record<string, number>;
  confidence: number | null;
  reason?: string;
  reviewedAt?: string;
};

/** An edit is listed in every wing whose weight is at least this (plus its primary wing). */
export const WING_MEMBER_MIN = 0.5;

/**
 * Visibility gate. Josiah-approved edits are always live. Everything else must pass visual review.
 * Unreviewed edits: only the hand-kept seed items (already reviewed by hand).
 */
export function isLive(e: Pick<Edit, "status">, r: Review | undefined): boolean {
  if (e.status === "approved_by_josiah") return true;
  if (r) return r.verdict === "pass";
  return e.status === "hand_kept";
}

/** Merge a review into an edit: primary wing, weights and wing memberships. */
export function applyReview(e: Edit, r: Review | undefined): Edit {
  if (!r || !r.wing) return { ...e, wings: e.wings?.length ? e.wings : [e.wing] };
  const wings = Array.from(new Set([r.wing, ...Object.entries(r.weights).filter(([, w]) => w >= WING_MEMBER_MIN).map(([k]) => k)]));
  return { ...e, wing: r.wing, weights: r.weights, wings };
}
