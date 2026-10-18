import "server-only";
import raw from "../../data/edits.json";

export type EditStatus = "unscreened" | "flagged_review" | "flagged_medium" | "hand_kept" | "approved";

export type Edit = {
  id: string;
  url: string;
  author: string;
  authorName: string;
  /** Stored for screening/genre tagging only. Never render this. */
  caption: string;
  createdAt: string | null;
  likes: number;
  bookmarks: number;
  views: number;
  videoViews: number;
  durationS: number | null;
  mediaType: string | null;
  thumb: string | null;
  width: number | null;
  height: number | null;
  genre: string | null;
  wing: string;
  subject: string;
  status: EditStatus;
  source: string;
};

export type Wing = {
  slug: string;
  name: string;
  tagline: string;
  /** Ranking lean: edits that celebrate civilization rank higher. Nothing is removed for its wing. */
  civBoost: number;
};

export const WINGS: Wing[] = [
  { slug: "rome", name: "Rome & Empires", tagline: "Legions, marble, the eternal city.", civBoost: 0.6 },
  { slug: "christendom", name: "Christendom", tagline: "Cathedrals, saints, sacred art.", civBoost: 0.6 },
  { slug: "americana", name: "Americana", tagline: "Frontier, founders, 250 years.", civBoost: 0.6 },
  { slug: "medieval", name: "Medieval & Crusades", tagline: "Knights, kings, the Isles.", civBoost: 0.5 },
  { slug: "military", name: "Military", tagline: "Valor and the long war history.", civBoost: 0.5 },
  { slug: "history", name: "History & Maps", tagline: "Empires rise. Borders move.", civBoost: 0.5 },
  { slug: "frontier", name: "Space & Nature", tagline: "Launches, frontiers, the wild.", civBoost: 0.6 },
  { slug: "arena", name: "Sports & F1", tagline: "Speed, glory, the final lap.", civBoost: 0.3 },
  { slug: "screen", name: "Film & Anime", tagline: "Cinema and the animated canon.", civBoost: 0.2 },
  { slug: "aesthetic", name: "Aesthetic", tagline: "Mood, style, atmosphere.", civBoost: 0.2 },
  { slug: "commentary", name: "Commentary & Memes", tagline: "The timeline, edited.", civBoost: 0 },
  { slug: "unsorted", name: "Unsorted", tagline: "Awaiting a genre tag.", civBoost: -0.2 },
];

export const wingBySlug = (slug: string) => WINGS.find((w) => w.slug === slug);

const STATUS_ADJ: Record<EditStatus, number> = {
  approved: 0.2,
  hand_kept: 0.2,
  unscreened: 0,
  flagged_review: -0.3,
  flagged_medium: -0.6,
};

/** Freedom of speech, not freedom of reach: engagement + civilization lean + screening state. */
export function score(e: Edit): number {
  const engagement = Math.log10(e.likes + 2 * e.bookmarks + 1) + 0.3 * Math.log10(e.views + 1);
  const wing = wingBySlug(e.wing);
  return engagement + (wing?.civBoost ?? 0) + STATUS_ADJ[e.status];
}

export const EDITS: Edit[] = (raw as Edit[])
  .filter((e) => e.thumb)
  .sort((a, b) => score(b) - score(a));

export const editsInWing = (slug: string) => EDITS.filter((e) => e.wing === slug);

/** Public, caption-free projection sent to client components. */
export type PublicEdit = Omit<Edit, "caption" | "subject">;
export const toPublic = (e: Edit): PublicEdit => {
  const { caption, subject, ...rest } = e;
  void caption;
  void subject;
  return rest;
};


/** Hall of Fame: top-ranked with a per-creator cap so one account can't fill the wall. */
export function hallOfFame(n = 12, perAuthor = 2): Edit[] {
  const counts: Record<string, number> = {};
  const out: Edit[] = [];
  for (const e of EDITS) {
    if ((counts[e.author] ?? 0) >= perAuthor) continue;
    counts[e.author] = (counts[e.author] ?? 0) + 1;
    out.push(e);
    if (out.length >= n) break;
  }
  return out;
}
