"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicEdit } from "@/lib/data";
import { fmtCount, fmtDuration } from "@/lib/format";
import { useGenres } from "@/lib/prefs";

/** Short-form vertical scroll. Media plays on X (no re-hosting, no caption-bearing tweet embed). */
export function Feed({ items, wingNames }: { items: PublicEdit[]; wingNames: Record<string, string> }) {
  const genres = useGenres();
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const ordered = useMemo(() => {
    if (!genres?.length) return items;
    // Picked genres first (keeping rank order), then everything else interleaved 1 in 4 for discovery.
    const mine = items.filter((e) => genres.includes(e.wing));
    const rest = items.filter((e) => !genres.includes(e.wing));
    const out: PublicEdit[] = [];
    let r = 0;
    mine.forEach((e, i) => { out.push(e); if (i % 3 === 2 && r < rest.length) out.push(rest[r++]); });
    return out.concat(rest.slice(r));
  }, [items, genres]);

  return (
    <div className="no-scrollbar h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-scroll sm:h-dvh">
      {genres !== null && !genres.length && (
        <div className="flex snap-start items-center justify-between gap-3 border-b border-line bg-panel px-4 py-3 text-sm">
          <span className="text-mute">Showing the global ranking.</span>
          <Link href="/onboarding" className="font-bold text-gold hover:underline">Pick genres →</Link>
        </div>
      )}
      {ordered.map((e) => {
        const dur = fmtDuration(e.durationS);
        return (
          <section key={e.id} className="relative flex h-[calc(100dvh-4rem)] snap-start snap-always items-center justify-center overflow-hidden bg-black sm:h-dvh">
            {e.thumb && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.thumb} alt="" aria-hidden referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl" />
                <a href={e.url} target="_blank" rel="noopener noreferrer" aria-label={`Play edit by @${e.author} on X`} className="group relative z-10 flex h-full w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.thumb} alt="" referrerPolicy="no-referrer" loading="lazy" className="max-h-full max-w-full object-contain" />
                  <span className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur transition group-hover:bg-gold group-hover:text-black">
                    <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>
                  </span>
                </a>
              </>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/60 to-transparent px-4 pb-5 pt-16">
              <div className="pointer-events-auto flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <a href={`https://x.com/${e.author}`} target="_blank" rel="noopener noreferrer" className="block truncate text-lg font-extrabold hover:underline">@{e.author}</a>
                  <p className="text-sm text-mute">
                    {wingNames[e.wing] ?? e.wing}{dur ? ` · ${dur}` : ""} · {fmtCount(e.views)} views
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-4">
                  <button onClick={() => setLiked((l) => ({ ...l, [e.id]: !l[e.id] }))} aria-pressed={!!liked[e.id]} className="flex flex-col items-center text-xs font-semibold">
                    <span className={`text-2xl ${liked[e.id] ? "text-gold" : ""}`}>♥</span>
                    {fmtCount(e.likes + (liked[e.id] ? 1 : 0))}
                  </button>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-xs font-semibold hover:text-gold">
                    <span className="text-2xl">↗</span>On X
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
