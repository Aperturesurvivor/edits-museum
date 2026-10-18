import type { PublicEdit } from "@/lib/data";
import { fmtCount, fmtDuration } from "@/lib/format";

/**
 * Caption-free card: thumbnail + play affordance (opens the post on X), creator handle, link to original.
 * We never render post captions and never re-host video. No official tweet embed (it always shows caption text).
 */
export function EditCard({ edit, rank, size = "md" }: { edit: PublicEdit; rank?: number; size?: "md" | "lg" }) {
  const dur = fmtDuration(edit.durationS);
  return (
    <article className="group relative overflow-hidden rounded-xl border border-line bg-panel">
      <a href={edit.url} target="_blank" rel="noopener noreferrer" aria-label={`Play edit by @${edit.author} on X`}
        className={`relative block w-full overflow-hidden bg-black ${size === "lg" ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
        {edit.thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={edit.thumb} alt="" referrerPolicy="no-referrer" loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20 backdrop-blur transition group-hover:bg-gold group-hover:text-black">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>
          </span>
        </span>
        {rank !== undefined && (
          <span className="absolute left-2 top-2 min-w-9 rounded-md bg-black/75 px-2 py-0.5 text-center font-display text-2xl font-extrabold text-gold">{rank}</span>
        )}
        {dur && <span className="absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold tabular-nums">{dur}</span>}
      </a>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
        <a href={`https://x.com/${edit.author}`} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate font-bold hover:underline">
          @{edit.author}
        </a>
        <div className="flex shrink-0 items-center gap-3 text-mute">
          <span className="tabular-nums">♥ {fmtCount(edit.likes)}</span>
          <a href={edit.url} target="_blank" rel="noopener noreferrer" className="hover:text-gold" aria-label="Original post on X">↗</a>
        </div>
      </div>
    </article>
  );
}
