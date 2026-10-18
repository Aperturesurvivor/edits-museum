"use client";
import type { PublicEdit } from "@/lib/types";
import { fmtCount, fmtDuration } from "@/lib/format";
import { usePlayer } from "./Player";

/**
 * Caption-free card: poster + play affordance (plays on-site in the lightbox), creator handle, View on X.
 * Never renders post captions. Uniform 4:5 frame, cover-cropped from the center.
 */
export function EditCard({ edit, list, index, rank }: { edit: PublicEdit; list: PublicEdit[]; index: number; rank?: number }) {
  const { open } = usePlayer();
  const dur = fmtDuration(edit.durationS);
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-panel">
      <button type="button" onClick={() => open(list, index)} aria-label={`Play edit by @${edit.author}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-black text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        {edit.thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={edit.thumb} alt="" referrerPolicy="no-referrer" loading="lazy" decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }} />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/30" />
        {rank !== undefined && (
          <span className="absolute left-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-md bg-accent px-1.5 font-display text-lg font-black leading-none text-white shadow">{rank}</span>
        )}
        {dur && <span className="absolute right-2 top-2 flex h-7 items-center rounded-md bg-black/75 px-1.5 text-xs font-semibold tabular-nums leading-none">{dur}</span>}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 ring-1 ring-white/25 backdrop-blur transition group-hover:scale-105 group-hover:bg-accent group-hover:text-white">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>
          </span>
        </span>
      </button>
      <div className="flex h-10 items-center justify-between gap-2 px-3 text-[13px]">
        <a href={`https://x.com/${edit.author}`} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate font-bold hover:underline">@{edit.author}</a>
        <div className="flex shrink-0 items-center gap-2.5 text-mute">
          <span className="tabular-nums">♥ {fmtCount(edit.likes)}</span>
          <a href={edit.url} target="_blank" rel="noopener noreferrer" className="hover:text-link" aria-label="View on X" title="View on X">↗</a>
        </div>
      </div>
    </article>
  );
}

export function EditGrid({ items, ranked = false }: { items: PublicEdit[]; ranked?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((e, i) => <EditCard key={e.id} edit={e} list={items} index={i} rank={ranked ? i + 1 : undefined} />)}
    </div>
  );
}
