# Codex brief: Edits Museum v1

You're joining as the **visual design and front-end owner**. Read this first, then `README.md` and `AGENTS.md` (Next.js 16 has breaking changes: middleware is now `src/proxy.ts`, `cacheComponents` is on. Check `node_modules/next/dist/docs/` before using an API).

## The product

**The greatest edits on Earth.** "The Pinterest/X for edits": a standalone website (an app maybe later) where people find the hardest fan-made edits and the assets to make their own. Audience first. Everything is free. No paywalls, no Stripe, no domain yet, open source (MIT). Hosting will be Vercel's free tier later; right now it's a private tailnet preview.

### Brand: pro-America (Josiah, Oct 18)

"American colors, American style, American supremacy," meaning **national pride and excellence**: America as the best at space, military aviation, sports, the frontier, the founders and industry. **National pride only, nothing racial.** The voice is confident and bold ("The greatest edits on Earth.").

- **Americana is the lead wing.** It comes first in the Grand Hall (a featured block above the Hall of Fame), gets the biggest ranking boost, and is featured and preselected in onboarding.
- Rome, Christendom and Western heritage (Medieval, History) get secondary boosts. Every other genre is a normal wing.
- **US-only in production.** `src/proxy.ts` rewrites non-US visitors to `/us-only` ("Available in the United States only") based on Vercel's `x-vercel-ip-country`. It's enforced only on Vercel (`VERCEL=1`) or with `EM_GEO_GATE=on`. Local dev and the tailnet preview bypass it. `EM_GEO_GATE=off` disables it. A missing header fails open.

## Sections

| Route | What it is |
|---|---|
| `/` | Grand Hall: hero, the **Americana** lead block, Hall of Fame (top 12, one per creator), then a contained carousel row per wing |
| `/hall/[wing]` | One wing: top 60 ranked, as a grid |
| `/feed` | Short-form vertical snap feed. The in-view edit autoplays muted and loops (unmute toggle; j/k/m keys). Paged via `/api/feed` |
| `/onboarding` | Pick genres (Americana featured and preselected). Stored in `localStorage` (`em:genres`) |
| `/submit` | Paste an X post link → `POST /api/submissions` → pending queue |
| `/armory` | Asset directory: a link hub, not an editor |
| `/about`, `/us-only` | Rules; the geo-gate page |

## Design direction

X's visual language, more dialed in and stronger, in **white, black, red and blue**. Tasteful, not flag kitsch.

- Pure black base (`#000`), white text, X-style hairline borders (`#2f3336`), grey secondary text (`#71767b`).
- **Primary accent: American red.** `accent` `#e0283c` (UI: CTAs, active nav, rank badges, focus) and `accent-deep` `#b22234` (hover/pressed, big fills).
- **Secondary: blue.** `blue` `#2f5bea` (secondary buttons, chips), `navy` `#3c3b6e` (subtle fills, borders), `link` `#6b8cff` (text links; tuned for contrast on black).
- **Type:** headlines use a heavy condensed sans (Barlow Condensed 900, uppercase, tight leading) via the `.display` class / `font-display`. Body is Inter, heavy weights for emphasis. No serif anywhere; the old Cinzel and gold are gone.
- **Motifs, sparingly:** a ★ glyph on eyebrow labels and a thin red-white-blue `.stripe` under the hero. Don't add more flags, eagles or stars without a reason.
- Tight spacing. A centered shell: left nav (72px, or 260px at ≥1280), a main column (max 700px, `min-w-0`), and a right rail (320px at ≥1024) with wings and a submit CTA. Bottom tab bar on mobile. **No page-level horizontal overflow** (checked at 390/1280/1440/1920).
- Cards: a uniform 4:5 frame, `object-cover` from the center, the rank badge top-left and duration top-right at the same height, and a fixed-height footer row.
- Tokens live in `src/app/globals.css` (`@theme`): `ink`, `panel`, `line`, `mute`, `bone`, `accent`, `accent-deep`, `blue`, `navy`, `link`, `font-display`.

## Media rules (hard requirements)

1. **Never render post captions.** Cards, feed and player show only the creator's handle (linked to their X profile), a "View on X" link (attribution), the poster and the video.
2. **Videos play on-site** in an HTML5 `<video>` streaming X's CDN MP4 (`video.twimg.com`) with the X thumbnail as the poster. Cards open the lightbox player (`src/components/Player.tsx`, prev/next, ←/→, Esc). The feed autoplays the in-view edit muted (`src/components/Video.tsx`).
3. **Never download or re-host video.** We store only X's URLs (`video.hi` ≈720p, `video.lo` the lowest bitrate).
4. **The site sends no Referer** (`Referrer-Policy: no-referrer` in `next.config.ts` plus `metadata.referrer`). X's CDN returns 403 to foreign referrers. Keep this.
5. Dead posts: `Video` falls back hi → lo → an "unavailable" state with a link to X.
6. No official tweet embeds (they always show caption text).
7. Captions are kept privately for screening (`data/private/`, gitignored) and are blank in `data/edits.json`. `toPublic()` strips caption/subject/genre/source before anything reaches a client component. Client components import from `src/lib/types.ts`, `src/lib/wings.ts` and `src/lib/format.ts`, never `src/lib/data.ts` or `src/lib/repo/*` (both `server-only`).

## Architecture

- Next.js 16 (App Router, Turbopack, `cacheComponents`), React 19, TypeScript, Tailwind v4.
- **Data layer:** `src/lib/repo/types.ts` defines `EditRepository` / `SubmissionRepository`. `repo/json.ts` (default) reads `data/edits.json` and writes submissions to `data/runtime/` (gitignored). `repo/supabase.ts` implements the same interface over Supabase's REST API (no SDK); select it with `EM_DATA_BACKEND=supabase`. The schema is in `supabase/schema.sql`. Pages call cached helpers in `src/lib/data.ts` (`"use cache"`).
- **Ranking** (`src/lib/ranking.ts`): `log10(likes + 2·bookmarks) + 0.3·log10(views)`, plus the best of `civBoost × weight` over the edit's wings (civBoost: Americana 1.0; Rome/Christendom 0.6; Medieval/History 0.4; others 0.3 and below), plus a status adjustment (`approved_by_josiah` +0.3, `hand_kept` +0.2, flagged review −0.3, flagged medium −0.6).
- **Visual review:** nothing is listed until it passes `notebooks/review.ipynb` (frames + transcript, SigLIP 2 + Qwen2.5-VL), applied by `scripts/ingest-verdicts.py` into `data/review.json`. Each edit gets 0-1 weights per wing; `wing` is the primary (max), `wings` is every wing it's listed in (weight ≥ 0.5). Ranking multiplies each wing's civBoost by its weight. Gate: `src/lib/review.ts`. See README.
- **Catalog:** 2,716 edits, all with MP4 sources: 341 from the original thread, 2,365 from genre searches, and 12 hand-approved by Josiah. Excluded until screening exists: flagged high, NSFW, non-edit, X `possibly_sensitive`, and two posts ruled out by hand. Generated by `scripts/export-seed.py` from raw pulls kept outside the repo.

## Who owns what

- **Codex: visual design and front end.** Layout, components, typography, motion, responsive and mobile polish, accessibility, empty and loading states, and the feed and player feel, within the media rules above.
- **Chief of Staff (Josiah's other agent): importer, screening, data, ranking, deploy and review.** That covers the X genre auto-import, the screening pipeline (illegal / non-edit / NSFW), the schema and `data/`, the repo layer, the geo gate, the preview and production deploys, and PR review.
- Josiah decides product direction and taste. When the two of you disagree, ask him.

## How we work

- Branch off `main` (`codex/<topic>`), open a PR, and describe what changed, with screenshots at 390/1280/1440/1920 for UI work. Chief of Staff reviews and merges. Don't push to `main` directly.
- `npm run lint` and `npm run build` must pass.
- Don't change `data/`, ranking, the repo layer or `src/proxy.ts` in a design PR. Ask in the PR.
- **Never commit secrets, tokens, `.env` files, logs or `data/runtime/` / `data/private/`.**

## Good first targets

1. Hero and Grand Hall polish: the American type system, stripe/star restraint, wing headers.
2. Feed: a progress bar, a tap-to-unmute hint, swipe feel, preloading the next video.
3. Player: swipe on mobile, scrubbing, a share/copy-link button.
4. Card skeletons and a dead-thumbnail fallback.
5. A first-visit flow: send new users to onboarding before the feed.
