export type Wing = {
  slug: string;
  name: string;
  tagline: string;
  /** Ranking lean: edits that celebrate civilization rank higher. Nothing is removed for its wing. */
  civBoost: number;
};

/**
 * Pro-America: Americana is the lead wing (first in the Hall, biggest ranking boost, featured in onboarding).
 * Rome, Christendom and Western heritage get secondary boosts. Every other genre is a normal wing.
 */
export const LEAD_WING = "americana";

export const WINGS: Wing[] = [
  { slug: "americana", name: "Americana", tagline: "Founders, frontier, industry. 250 years of America.", civBoost: 1.0 },
  { slug: "rome", name: "Rome & Antiquity", tagline: "Legions, Greece, the eternal city.", civBoost: 0.6 },
  { slug: "christendom", name: "Christendom", tagline: "Cathedrals, saints, sacred art.", civBoost: 0.6 },
  { slug: "medieval", name: "Medieval & Norse", tagline: "Knights, kings, longships.", civBoost: 0.4 },
  { slug: "history", name: "History & Empires", tagline: "Empires rise. Borders move.", civBoost: 0.4 },
  { slug: "builders", name: "Builders", tagline: "Megaprojects, engineering, architecture.", civBoost: 0.3 },
  { slug: "frontier", name: "Space & Frontier", tagline: "Launches, wilderness, the unknown.", civBoost: 0.3 },
  { slug: "military", name: "Military", tagline: "Valor, aviation, the long war history.", civBoost: 0.3 },
  { slug: "motorsport", name: "F1 & Motorsport", tagline: "Speed, engineering, the final lap.", civBoost: 0.2 },
  { slug: "arena", name: "Sports", tagline: "Football, fights, the big moments.", civBoost: 0.2 },
  { slug: "screen", name: "Film & Anime", tagline: "Cinema, anime, games.", civBoost: 0.1 },
  { slug: "aesthetic", name: "Aesthetic", tagline: "Mood, style, icons.", civBoost: 0.1 },
  { slug: "commentary", name: "Commentary & Memes", tagline: "The timeline, edited.", civBoost: 0 },
  { slug: "unsorted", name: "Unsorted", tagline: "Awaiting a genre tag.", civBoost: -0.2 },
];

export const wingBySlug = (slug: string) => WINGS.find((w) => w.slug === slug);
export const wingName = (slug: string) => wingBySlug(slug)?.name ?? slug;
