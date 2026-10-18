import type { Edit, Submission } from "../types";

export type ListQuery = {
  /** Only these wings. */
  wings?: string[];
  /** Exclude these wings. */
  notWings?: string[];
  offset?: number;
  limit: number;
};

/**
 * Storage boundary. The app only talks to this interface, so swapping the JSON file for Supabase
 * (or anything else) is a matter of implementing it and flipping EM_DATA_BACKEND.
 * Lists are always returned ranked by `score` descending.
 */
export interface EditRepository {
  listRanked(q: ListQuery): Promise<Edit[]>;
  getEdit(id: string): Promise<Edit | null>;
  wingCounts(): Promise<Record<string, number>>;
  hasEdit(id: string): Promise<boolean>;
}

export interface SubmissionRepository {
  has(id: string): Promise<boolean>;
  add(s: Submission): Promise<void>;
  countPending(): Promise<number>;
}
