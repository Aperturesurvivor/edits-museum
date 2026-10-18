# Codex brief: Edits Museum v1

You're joining as the **visual design and front-end owner**. Read this first, then `README.md` and `AGENTS.md` (Next.js 16 has breaking changes; check `node_modules/next/dist/docs/` before using an API).

## The product

"The Pinterest/X for edits": a standalone website (an app maybe later) where people find the hardest fan-made edits and the assets to make their own. Audience first. Everything is free. No paywalls, no Stripe, no domain yet, open source (MIT). Hosting will be Vercel's free tier later; right now it's a private preview.

Sections in v1:

| Route | What it is | State |
|---|---|---|
| `/` | **Grand Hall**: Hall of Fame (top 12, max 2 per creator) plus a row per genre wing | first pass |
| `/hall/[wing]` | One wing: every edit in that genre, ranked | first pass |
| `/feed` | Short-form vertical snap scroll, ordered by picked genres (1 in 4 slots are discovery) | first pass |
| `/onboarding` | Pick genres like X interests. Stored in `localStorage` (`em:genres`) for v1 | first pass |
| `/submit` | Paste an X post link, optional genre → `POST /api/submissions` → pending queue | first pass, file-backed stub |
| `/armory` | Asset directory: music, SFX, footage, overlays, type. Link hub only, not an editor | first pass |
| `/about` | Rules and ranking, in plain words | first pass |

## Design direction (Josiah, Oct 18)

**Not** marble-and-gold "power aesthetics." The look is **X's visual language, more dialed in and stronger**:

- Pure black (`#000`) background, X-style hairline borders (`#2f3336`), muted grey secondary text (`#71767b`).
- Tight spacing and a dense, confident layout. A left rail on desktop, a bottom tab bar on mobile.
- Bold sans (Inter, heavy weights) for everything.
- **One accent: muted gold (`#c9a961`).** Use it sparingly: active state, primary CTA, ranks.
- Full-bleed media. The edits bring the intensity, so the chrome stays out of the way.
- **Serif display (Cinzel) only for Grand Hall headers** (the hall title, wing names, Hall of Fame). Nowhere else.
- Design tokens live in `src/app/globals.css` (`@theme`): `ink`, `panel`, `line`, `mute`, `bone`, `gold`, `gold-dim`, `font-display`.

## Media rules (hard requirements)

1. **Never render post captions.** Cards and the feed show only the creator's handle (linked to their X profile), a link to the original post (attribution), the thumbnail, and a play affordance.
2. **No official tweet embeds inline.** The X embed always shows caption text. Tapping play opens the post on X, where it plays.
3. **Never re-host video.** Thumbnails are hotlinked from X's CDN (`pbs.twimg.com`, `referrerPolicy="no-referrer"`).
4. `caption` stays in the data for screening and genre tagging. It's stripped server-side by `toPublic()` in `src/lib/data.ts` before anything reaches a client component. Keep it that way: client components import formatting helpers from `src/lib/format.ts`, never from `src/lib/data.ts` (which is `server-only`).

## Current architecture

- Next.js 16 (App Router, Turbopack, `cacheComponents` on), React 19, TypeScript, Tailwind v4. No database yet.
- `data/edits.json` is the catalog, imported at build time. `src/lib/data.ts` holds types, wings, the ranking `score()` and `hallOfFame()`.
- Ranking: `log10(likes + 2·bookmarks) + 0.3·log10(views)` plus a per-wing civilization lean (`civBoost`) plus a screening-status adjustment. Nothing is removed for its genre; flagged items just rank lower.
- Submissions: `src/app/api/submissions/route.ts` validates X status URLs (`src/lib/submissions.ts`) and appends to `data/runtime/submissions.jsonl` (gitignored). This won't work on Vercel's read-only filesystem; it moves to a real DB before deploy.
- Likes in the feed are local UI state only (no accounts yet).

## Who owns what

- **Codex: visual design and front end.** Layout, components, typography, motion, responsive and mobile polish, accessibility, empty and loading states, and the feed feel (autoplay-adjacent affordances that stay within the media rules above).
- **Chief of Staff (Josiah's other agent): importer, screening, data, deploy and review.** That covers the genre-based X auto-import, the screening pipeline (illegal / non-edit / NSFW), the data schema, `data/edits.json`, ranking, the submissions backend, preview and production deploys, and PR review.
- Josiah decides product direction and taste. When the two of you disagree, ask him.

## How we work

- Branch off `main` (`codex/<topic>`), open a PR, and describe what changed with screenshots for UI work. Chief of Staff reviews and merges. Don't push to `main` directly.
- `npm run lint` and `npm run build` must pass before a PR is ready.
- Don't change `data/edits.json`, ranking or moderation logic in a design PR. Ask in the PR instead.
- **Never commit secrets, tokens, `.env` files, logs or runtime data.** None are needed for v1.

## Good first targets

1. Tighten the Grand Hall: hero, Hall of Fame grid density, wing rows (consider an X-style tab strip for wings).
2. Feed polish: snap feel, the action rail, a progress hint, keyboard navigation (j/k) on desktop.
3. Card system: hover and focus states, skeletons for slow thumbnails, a fallback when a thumbnail 404s (dead post).
4. Onboarding as a first-visit flow (route new users there from the feed).
5. Mobile: safe-area insets, bottom bar, tap targets.
