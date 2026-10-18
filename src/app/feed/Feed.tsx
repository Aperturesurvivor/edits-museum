"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicEdit } from "@/lib/types";
import { fmtCount, fmtDuration } from "@/lib/format";
import { wingName } from "@/lib/wings";
import { useGenres } from "@/lib/prefs";
import { Video } from "@/components/Video";

/** Short-form vertical feed. The in-view edit autoplays (muted by default), loops; others pause. */
export function Feed() {
  const genres = useGenres();
  const [items, setItems] = useState<PublicEdit[]>([]);
  const [cursor, setCursor] = useState({ mo: 0, ro: 0, done: false });
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const loading = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const key = genres?.join(",") ?? null;

  const load = useCallback(async (reset: boolean, c = { mo: 0, ro: 0 }) => {
    if (loading.current || key === null) return;
    loading.current = true;
    try {
      const r = await fetch(`/api/feed?wings=${encodeURIComponent(key)}&mo=${c.mo}&ro=${c.ro}`);
      const j: { items: PublicEdit[]; mo: number; ro: number; done: boolean } = await r.json();
      setItems((prev) => {
        const base = reset ? [] : prev;
        const seen = new Set(base.map((e) => e.id));
        return base.concat(j.items.filter((e) => !seen.has(e.id)));
      });
      setCursor({ mo: j.mo, ro: j.ro, done: j.done });
    } finally {
      loading.current = false;
    }
  }, [key]);

  useEffect(() => {
    if (key === null) return;
    rootRef.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(0);
    load(true);
  }, [key, load]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(Number((en.target as HTMLElement).dataset.i));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-i]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (!cursor.done && items.length && active >= items.length - 4) load(false, cursor);
  }, [active, items.length, cursor, load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const root = rootRef.current;
      if (!root) return;
      if (e.key === "j" || e.key === "ArrowDown") { e.preventDefault(); root.scrollBy({ top: root.clientHeight, behavior: "smooth" }); }
      if (e.key === "k" || e.key === "ArrowUp") { e.preventDefault(); root.scrollBy({ top: -root.clientHeight, behavior: "smooth" }); }
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={rootRef} className="no-scrollbar h-[calc(100dvh-3.5rem)] snap-y snap-mandatory overflow-y-scroll overscroll-contain sm:h-dvh">
      {genres !== null && !genres.length && (
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-black/85 px-4 py-2.5 text-sm backdrop-blur">
          <span className="text-mute">Showing the global ranking.</span>
          <Link href="/onboarding" className="font-bold text-link hover:underline">Pick genres →</Link>
        </div>
      )}
      {items.map((e, i) => {
        const near = Math.abs(i - active) <= 1;
        const dur = fmtDuration(e.durationS);
        return (
          <section key={e.id} data-i={i} className="relative flex h-[calc(100dvh-3.5rem)] snap-start snap-always items-center justify-center overflow-hidden bg-black sm:h-dvh">
            {near ? (
              <Video edit={e} active={i === active} muted={muted} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              e.thumb && <img src={e.thumb} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-contain" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent px-4 pb-5 pt-20">
              <div className="pointer-events-auto flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <a href={`https://x.com/${e.author}`} target="_blank" rel="noopener noreferrer" className="block truncate text-lg font-extrabold hover:underline">@{e.author}</a>
                  <p className="truncate text-sm text-mute">{wingName(e.wing)}{dur ? ` · ${dur}` : ""} · {fmtCount(e.views)} views</p>
                </div>
                <div className="flex shrink-0 flex-col items-center gap-4">
                  <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20 backdrop-blur hover:bg-black/80">
                    {muted ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></svg>
                    )}
                  </button>
                  <button onClick={() => setLiked((l) => ({ ...l, [e.id]: !l[e.id] }))} aria-pressed={!!liked[e.id]} className="flex flex-col items-center text-xs font-semibold">
                    <span className={`text-2xl leading-none ${liked[e.id] ? "text-accent" : ""}`}>♥</span>
                    {fmtCount(e.likes + (liked[e.id] ? 1 : 0))}
                  </button>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-xs font-semibold hover:text-accent">
                    <span className="text-2xl leading-none">↗</span>View on X
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}
      {items.length === 0 && <div className="flex h-full items-center justify-center text-mute">Loading…</div>}
    </div>
  );
}
