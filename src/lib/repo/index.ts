import "server-only";
import { jsonEdits, jsonSubmissions } from "./json";
import { supabaseEdits, supabaseSubmissions } from "./supabase";
import type { EditRepository, SubmissionRepository } from "./types";

/** EM_DATA_BACKEND=json (default, data/edits.json) | supabase */
const backend = process.env.EM_DATA_BACKEND === "supabase" ? "supabase" : "json";

export const edits: EditRepository = backend === "supabase" ? supabaseEdits : jsonEdits;
export const submissions: SubmissionRepository = backend === "supabase" ? supabaseSubmissions : jsonSubmissions;
