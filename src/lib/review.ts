import type { Edit } from "./types";

/** Visual review verdict, produced by scripts/visual-review (frames from the actual video, not text keywords). */
export type Review = {
  /** Wing by what's on screen. Overrides the keyword genre. */
  wing?: string;
  isEdit: boolean;
  nsfw: boolean;
  /** Celebrates Western civilization (Americana first). */
  fit: boolean;
  confidence: "high" | "medium" | "low";
  reason?: string;
  reviewedAt: string;
};

export type Verdict = "live" | "reject_nsfw" | "reject_not_edit" | "reject_unfit" | "queue_low_confidence";

export function verdictOf(r: Review): Verdict {
  if (r.nsfw) return "reject_nsfw";
  if (!r.isEdit) return "reject_not_edit";
  if (!r.fit) return "reject_unfit";
  if (r.confidence === "low") return "queue_low_confidence";
  return "live";
}

/**
 * Visibility gate. Josiah-approved edits are always live. Everything else must pass visual review.
 * Unreviewed edits fall back to: hand-kept seed items only.
 */
export function isLive(e: Pick<Edit, "status" | "source">, r: Review | undefined): boolean {
  if (e.status === "approved_by_josiah") return true;
  if (r) return verdictOf(r) === "live";
  return e.status === "hand_kept";
}
